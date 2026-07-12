import { db } from '../firebase/config.js';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { COLLECTIONS } from '../utils/constants.js';

const AVATAR_DOC = 'avatars';

const avatarRef = () => doc(db, COLLECTIONS.CONFIG, AVATAR_DOC);

// In-memory cache: avatarId -> dataURL (or null for default)
let _cache = {};

export async function loadAvatarOverrides() {
  const snap = await getDoc(avatarRef());
  if (snap.exists()) {
    _cache = snap.data().overrides || {};
  }
  return _cache;
}

export function watchAvatarOverrides(callback) {
  return onSnapshot(avatarRef(), snap => {
    _cache = snap.exists() ? (snap.data().overrides || {}) : {};
    callback(_cache);
  });
}

export function getCachedAvatarSrc(avatarId, defaultFile) {
  return _cache[avatarId] || `assets/avatars/${defaultFile}`;
}

export async function uploadAvatarOverride(avatarId, file) {
  const dataUrl = await fileToDataUrl(file);
  const current = (await getDoc(avatarRef())).data()?.overrides || {};
  await setDoc(avatarRef(), {
    overrides: { ...current, [avatarId]: dataUrl },
  });
  _cache[avatarId] = dataUrl;
}

export async function resetAvatarOverride(avatarId) {
  const current = (await getDoc(avatarRef())).data()?.overrides || {};
  delete current[avatarId];
  await setDoc(avatarRef(), { overrides: current });
  delete _cache[avatarId];
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
