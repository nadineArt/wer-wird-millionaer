import { db } from '../firebase/config.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { COLLECTIONS, CONFIG_DOC, STORAGE_KEYS } from '../utils/constants.js';

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function getAppConfig() {
  const ref = doc(db, COLLECTIONS.CONFIG, CONFIG_DOC);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function loginPlayer(password) {
  const config = await getAppConfig();
  if (!config) throw new Error('Konfiguration nicht gefunden.');

  const hash = await sha256(password.trim());
  const playerHash = await sha256('WWM');

  const isPlayer = hash === config.playerPasswordHash || hash === config.adminPasswordHash;
  if (!isPlayer) return false;

  localStorage.setItem(STORAGE_KEYS.PLAYER_ACCESS, JSON.stringify({
    granted: true,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  }));
  return true;
}

export async function loginAdmin(password) {
  const config = await getAppConfig();
  if (!config) throw new Error('Konfiguration nicht gefunden.');

  const hash = await sha256(password.trim());
  if (hash !== config.adminPasswordHash) return false;

  sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify({
    authenticated: true,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  }));
  return true;
}

export function isPlayerAccessGranted() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYER_ACCESS) || '{}');
    return data.granted && data.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function isAdminAuthenticated() {
  try {
    const data = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) || '{}');
    return data.authenticated && data.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function logoutAdmin() {
  sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
}

export function clearPlayerAccess() {
  localStorage.removeItem(STORAGE_KEYS.PLAYER_ACCESS);
}

export async function initAppConfig() {
  const CONFIG_VERSION = 1;
  const ref = doc(db, COLLECTIONS.CONFIG, CONFIG_DOC);
  const snap = await getDoc(ref);

  if (!snap.exists() || !snap.data().configVersion) {
    // Doc missing or was manually created without configVersion — write correct hashes
    const existing = snap.exists() ? snap.data() : {};
    await setDoc(ref, {
      playerPasswordHash: await sha256('WWM'),
      adminPasswordHash: await sha256('admin'),
      appTitle: existing.appTitle || 'Wer kennt ihn am besten?',
      configVersion: CONFIG_VERSION,
    });
  }
}

export async function updatePasswords({ playerPassword, adminPassword }) {
  const ref = doc(db, COLLECTIONS.CONFIG, CONFIG_DOC);
  const updates = {};
  if (playerPassword) updates.playerPasswordHash = await sha256(playerPassword.trim());
  if (adminPassword)  updates.adminPasswordHash  = await sha256(adminPassword.trim());
  await setDoc(ref, updates, { merge: true });
}
