import { db } from '../firebase/config.js';
import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, onSnapshot, serverTimestamp, writeBatch, setDoc,
} from 'firebase/firestore';
import { COLLECTIONS, SESSION_STATUS, QUESTION_STATE, PLAYER_STATUS } from '../utils/constants.js';
import { getQuestions, getGame } from './gameService.js';
import { getSafeStageFor } from '../utils/stageDefaults.js';

const sessionsRef = () => collection(db, COLLECTIONS.SESSIONS);
const sessionRef = (id) => doc(db, COLLECTIONS.SESSIONS, id);
const playersRef = (sid) => collection(db, COLLECTIONS.SESSIONS, sid, 'players');

export async function getOpenSession() {
  const q = query(
    sessionsRef(),
    where('status', 'in', [SESSION_STATUS.WAITING, SESSION_STATUS.ACTIVE]),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  docs.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
  return docs[0];
}

export async function createSession(gameId, masterId, joinBaseUrl) {
  const existing = await getOpenSession();
  if (existing) throw new Error('Es läuft bereits eine Session. Bitte erst beenden.');

  const game = await getGame(gameId);
  if (!game) throw new Error('Spiel nicht gefunden.');

  const questions = await getQuestions(gameId);
  if (questions.length === 0) throw new Error('Das Spiel hat noch keine Fragen.');

  const docRef = await addDoc(sessionsRef(), {
    gameId,
    gameTitle: game.title,
    stageLabels: game.stageLabels,
    questionsSnapshot: questions,
    status: SESSION_STATUS.WAITING,
    masterId,
    currentQuestionId: null,
    currentQuestionIndex: -1,
    currentQuestionState: null,
    startedAt: null,
    finishedAt: null,
    winnerId: null,
    createdAt: serverTimestamp(),
  });

  const joinUrl = `${joinBaseUrl}?session=${docRef.id}`;
  await updateDoc(docRef, { joinUrl });

  return { id: docRef.id, joinUrl };
}

export async function startGame(sessionId) {
  const snap = await getDoc(sessionRef(sessionId));
  if (!snap.exists()) throw new Error('Session nicht gefunden.');

  const session = snap.data();
  const questions = session.questionsSnapshot;
  if (!questions || questions.length === 0) throw new Error('Keine Fragen vorhanden.');

  const playersSnap = await getDocs(playersRef(sessionId));
  if (playersSnap.empty) throw new Error('Mindestens 1 Spieler:in muss dabei sein.');

  const firstQ = questions[0];
  await updateDoc(sessionRef(sessionId), {
    status: SESSION_STATUS.ACTIVE,
    currentQuestionId: firstQ.id,
    currentQuestionIndex: 0,
    currentQuestionState: QUESTION_STATE.WAITING,
    startedAt: serverTimestamp(),
  });

  // Pre-create audienceVotes doc with nested votes object so update() can
  // write to votes.A/B/C/D via dotted-key paths correctly
  await setDoc(
    doc(db, COLLECTIONS.SESSIONS, sessionId, 'audienceVotes', firstQ.id),
    { votes: { A: 0, B: 0, C: 0, D: 0 }, voters: {} },
    { merge: true },
  );
}

export async function revealAnswer(sessionId) {
  const snap = await getDoc(sessionRef(sessionId));
  if (!snap.exists()) throw new Error('Session nicht gefunden.');

  const session = snap.data();
  const { currentQuestionId, currentQuestionIndex, questionsSnapshot, stageLabels } = session;
  const question = questionsSnapshot[currentQuestionIndex];
  if (!question) throw new Error('Frage nicht gefunden.');

  const correctAnswer = question.correctAnswer;
  const currentStage = currentQuestionIndex + 1;

  const playersSnap = await getDocs(query(
    playersRef(sessionId),
    where('status', '==', PLAYER_STATUS.ACTIVE),
  ));

  const batch = writeBatch(db);

  batch.update(sessionRef(sessionId), {
    currentQuestionState: QUESTION_STATE.REVEALED,
  });

  for (const playerDoc of playersSnap.docs) {
    const player = playerDoc.data();
    const answer = player.answers?.[currentQuestionId]?.submitted ?? null;
    const isCorrect = answer === correctAnswer;

    if (isCorrect) {
      batch.update(playerDoc.ref, {
        [`answers.${currentQuestionId}.correct`]: true,
        currentStage,
      });
    } else {
      const safeStage = getSafeStageFor(currentStage - 1, stageLabels);
      batch.update(playerDoc.ref, {
        [`answers.${currentQuestionId}.correct`]: false,
        status: PLAYER_STATUS.ELIMINATED,
        eliminatedAtStage: safeStage,
        currentStage: safeStage,
      });
    }
  }

  await batch.commit();

  const updatedPlayersSnap = await getDocs(query(
    playersRef(sessionId),
    where('status', '==', PLAYER_STATUS.ACTIVE),
  ));

  if (currentStage === questionsSnapshot.length && updatedPlayersSnap.docs.length > 0) {
    const winnerBatch = writeBatch(db);
    for (const pd of updatedPlayersSnap.docs) {
      winnerBatch.update(pd.ref, { status: PLAYER_STATUS.WINNER });
    }
    const firstWinnerId = updatedPlayersSnap.docs[0].id;
    winnerBatch.update(sessionRef(sessionId), {
      status: SESSION_STATUS.FINISHED,
      winnerId: firstWinnerId,
      finishedAt: serverTimestamp(),
    });
    await winnerBatch.commit();
  } else if (updatedPlayersSnap.empty) {
    await updateDoc(sessionRef(sessionId), {
      status: SESSION_STATUS.FINISHED,
      finishedAt: serverTimestamp(),
    });
  }
}

export async function nextQuestion(sessionId) {
  const snap = await getDoc(sessionRef(sessionId));
  if (!snap.exists()) throw new Error('Session nicht gefunden.');

  const session = snap.data();
  const nextIndex = session.currentQuestionIndex + 1;
  const questions = session.questionsSnapshot;

  if (nextIndex >= questions.length) {
    await updateDoc(sessionRef(sessionId), {
      status: SESSION_STATUS.FINISHED,
      finishedAt: serverTimestamp(),
    });
    return;
  }

  const nextQ = questions[nextIndex];
  await updateDoc(sessionRef(sessionId), {
    currentQuestionId: nextQ.id,
    currentQuestionIndex: nextIndex,
    currentQuestionState: QUESTION_STATE.WAITING,
  });

  await setDoc(
    doc(db, COLLECTIONS.SESSIONS, sessionId, 'audienceVotes', nextQ.id),
    { votes: { A: 0, B: 0, C: 0, D: 0 }, voters: {} },
    { merge: true },
  );
}

export async function finishSession(sessionId) {
  await updateDoc(sessionRef(sessionId), {
    status: SESSION_STATUS.FINISHED,
    finishedAt: serverTimestamp(),
  });
}

export function watchSession(sessionId, callback) {
  return onSnapshot(sessionRef(sessionId), snap => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}

export function watchPlayers(sessionId, callback) {
  return onSnapshot(playersRef(sessionId), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export function watchAudienceVotes(sessionId, questionId, callback) {
  const ref = doc(db, COLLECTIONS.SESSIONS, sessionId, 'audienceVotes', questionId);
  return onSnapshot(ref, snap => {
    callback(snap.exists() ? snap.data() : { votes: { A: 0, B: 0, C: 0, D: 0 }, voters: {} });
  });
}
