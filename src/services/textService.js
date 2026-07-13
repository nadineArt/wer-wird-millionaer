import { db } from '../firebase/config.js';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { COLLECTIONS } from '../utils/constants.js';

const TEXT_DOC = 'uiTexts';
const textRef = () => doc(db, COLLECTIONS.CONFIG, TEXT_DOC);

export const TEXT_DEFAULTS = {
  // Access screen
  accessSubtitle:        'Das Geburtstagsquiz für echte Freunde.',
  accessButton:          'Rein da ✨',
  // Register screen
  registerTitle:         'Wähle deinen Look',
  registerSubtitle:      'Wer bist du heute Abend?',
  registerButton:        'Ich bin dabei 🎉',
  // Eliminated screen
  eliminatedTitle:       'Oops. Das war wohl nichts.',
  eliminatedBody:        'Vielleicht kennst du ihn doch nicht so gut wie du dachtest. Aber hey — du warst dabei. 🌹',
  eliminatedWatchButton: 'Trotzdem zuschauen',
  // Winner screen
  winnerSubtitle:        'Herzlichen Glückwunsch — du bist der ultimative {themeWord}-Experte. Das ist einmalig.',
  winnerCertificate:     'Du bist offiziell zertifiziert im {themeWord}. 🌟',
  // Joker modals
  jokerFiftyTitle:       '50:50 Joker',
  jokerFiftyBody:        'Zwei falsche Antworten werden eliminiert. Klingt easy — ist es auch. Aber sicher bist du dir trotzdem nicht, oder?',
  jokerFiftyConfirm:     'Zwei raus, zwei bleiben',
  jokerPhoneTitle:       'Telefonjoker',
  jokerPhoneBody:        'Ruf jetzt jemanden an oder frag eine Person in deiner Nähe. Du hast 30 Sekunden — oder so lange wie es dauert, bis die Person antwortet.',
  jokerPhoneConfirm:     'Joker einlösen',
  jokerAudienceTitle:    'Publikumsjoker',
  jokerAudienceBody:     'Sieh in Echtzeit, wie die anderen gerade abstimmen. Das Publikum hat nicht immer recht — aber meistens. Du entscheidest selbst, wann du deine Antwort abgibst.',
  jokerAudienceConfirm:  'Abstimmung anzeigen',
};

// In-memory cache
let _cache = { ...TEXT_DEFAULTS };

export async function loadUiTexts() {
  const snap = await getDoc(textRef());
  if (snap.exists()) {
    _cache = { ...TEXT_DEFAULTS, ...snap.data() };
  }
  return _cache;
}

export function watchUiTexts(callback) {
  return onSnapshot(textRef(), snap => {
    _cache = snap.exists()
      ? { ...TEXT_DEFAULTS, ...snap.data() }
      : { ...TEXT_DEFAULTS };
    callback(_cache);
  });
}

export function t(key, vars = {}) {
  let str = _cache[key] ?? TEXT_DEFAULTS[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replaceAll(`{${k}}`, v);
  }
  return str;
}

export async function saveUiTexts(updates) {
  await setDoc(textRef(), updates, { merge: true });
  _cache = { ..._cache, ...updates };
}
