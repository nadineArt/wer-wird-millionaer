import { db } from '../firebase/config.js';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { COLLECTIONS } from '../utils/constants.js';
import { DEFAULT_STAGE_LABELS } from '../utils/stageDefaults.js';

const gamesRef = () => collection(db, COLLECTIONS.GAMES);
const gameRef = (id) => doc(db, COLLECTIONS.GAMES, id);
const questionsRef = (gameId) => collection(db, COLLECTIONS.GAMES, gameId, 'questions');
const questionRef = (gameId, qId) => doc(db, COLLECTIONS.GAMES, gameId, 'questions', qId);

export async function createGame({ title, description = '' }) {
  const docRef = await addDoc(gamesRef(), {
    title,
    description,
    active: false,
    stageLabels: DEFAULT_STAGE_LABELS,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateGame(gameId, updates) {
  await updateDoc(gameRef(gameId), { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteGame(gameId) {
  const qs = await getDocs(questionsRef(gameId));
  const deletes = qs.docs.map(d => deleteDoc(d.ref));
  await Promise.all(deletes);
  await deleteDoc(gameRef(gameId));
}

export async function getAllGames() {
  const snap = await getDocs(gamesRef());
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getActiveGames() {
  const q = query(gamesRef(), where('active', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getGame(gameId) {
  const snap = await getDoc(gameRef(gameId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getQuestions(gameId) {
  const q = query(questionsRef(gameId), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createQuestion(gameId, { text, options, correctAnswer, stage, order }) {
  const docRef = await addDoc(questionsRef(gameId), {
    text,
    options,
    correctAnswer,
    stage,
    order,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateQuestion(gameId, questionId, updates) {
  await updateDoc(questionRef(gameId, questionId), updates);
}

export async function deleteQuestion(gameId, questionId) {
  await deleteDoc(questionRef(gameId, questionId));
}

export async function reorderQuestions(gameId, orderedIds) {
  const updates = orderedIds.map((id, index) =>
    updateDoc(questionRef(gameId, id), { order: index + 1 })
  );
  await Promise.all(updates);
}

export async function updateStageLabels(gameId, stageLabels) {
  await updateDoc(gameRef(gameId), { stageLabels, updatedAt: serverTimestamp() });
}
