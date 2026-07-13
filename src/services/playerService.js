import { db } from '../firebase/config.js';
import {
  doc, setDoc, updateDoc, getDoc, getDocs, onSnapshot,
  collection, query, where, increment, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { COLLECTIONS, PLAYER_STATUS, QUESTION_STATE, STORAGE_KEYS } from '../utils/constants.js';

const playerRef = (sessionId, playerId) =>
  doc(db, COLLECTIONS.SESSIONS, sessionId, 'players', playerId);
const playersRef = (sessionId) =>
  collection(db, COLLECTIONS.SESSIONS, sessionId, 'players');
const audienceVoteRef = (sessionId, questionId) =>
  doc(db, COLLECTIONS.SESSIONS, sessionId, 'audienceVotes', questionId);

export function getStoredPlayerId() {
  return localStorage.getItem(STORAGE_KEYS.PLAYER_ID);
}

export function getStoredSessionId() {
  return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
}

export function storePlayerIds(playerId, sessionId) {
  localStorage.setItem(STORAGE_KEYS.PLAYER_ID, playerId);
  localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
}

export function clearPlayerIds() {
  localStorage.removeItem(STORAGE_KEYS.PLAYER_ID);
  localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
}

export async function registerPlayer(sessionId, { name, avatar }) {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error('Ein Name muss sein. Auch wenn er peinlich ist.');
  if (trimmedName.length > 30) throw new Error('Name zu lang. Kürzer bitte.');

  const existingQ = query(playersRef(sessionId), where('name', '==', trimmedName));
  const existing = await getDocs(existingQ);
  if (!existing.empty) throw new Error('Den Namen hat schon jemand. Sei origineller.');

  const playerId = crypto.randomUUID();
  await setDoc(playerRef(sessionId, playerId), {
    name: trimmedName,
    avatar,
    status: PLAYER_STATUS.ACTIVE,
    currentStage: 0,
    eliminatedAtStage: null,
    jokersUsed: { fifty: false, phone: false, audience: false },
    answers: {},
    joinedAt: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
    isWatching: false,
  });

  storePlayerIds(playerId, sessionId);
  return playerId;
}

export async function getPlayer(sessionId, playerId) {
  const snap = await getDoc(playerRef(sessionId, playerId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function touchLastSeen(sessionId, playerId) {
  await updateDoc(playerRef(sessionId, playerId), { lastSeenAt: serverTimestamp() });
}

export async function submitAnswer(sessionId, playerId, questionId, answer, sessionData) {
  if (sessionData?.currentQuestionState === QUESTION_STATE.REVEALED) return;

  const playerSnap = await getDoc(playerRef(sessionId, playerId));
  if (!playerSnap.exists()) return;

  const player = playerSnap.data();
  if (player.answers?.[questionId]?.submitted) return;

  const batch = writeBatch(db);

  batch.update(playerRef(sessionId, playerId), {
    [`answers.${questionId}.submitted`]: answer,
    [`answers.${questionId}.answeredAt`]: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
  });

  // Doc is pre-created by sessionService when a question starts,
  // so update() correctly resolves dotted keys as nested field paths
  batch.update(audienceVoteRef(sessionId, questionId), {
    [`votes.${answer}`]: increment(1),
    [`voters.${playerId}`]: answer,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function setWatching(sessionId, playerId, watching) {
  await updateDoc(playerRef(sessionId, playerId), { isWatching: watching });
}

export function watchOwnPlayer(sessionId, playerId, callback) {
  return onSnapshot(playerRef(sessionId, playerId), snap => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}
