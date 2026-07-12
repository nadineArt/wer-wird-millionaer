import { db } from '../firebase/config.js';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { COLLECTIONS, JOKER_TYPES, ANSWERS } from '../utils/constants.js';

const playerRef = (sessionId, playerId) =>
  doc(db, COLLECTIONS.SESSIONS, sessionId, 'players', playerId);

export function canUseJoker(player, jokerType) {
  return !player.jokersUsed?.[jokerType];
}

export function getFiftyFiftyEliminations(question, selectedAnswer) {
  const wrong = ANSWERS.filter(a => a !== question.correctAnswer);
  const protect = selectedAnswer && selectedAnswer !== question.correctAnswer
    ? selectedAnswer
    : null;

  const candidates = protect
    ? wrong.filter(a => a !== protect)
    : wrong;

  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

export async function useFiftyFifty(sessionId, playerId, question, selectedAnswer) {
  await updateDoc(playerRef(sessionId, playerId), {
    'jokersUsed.fifty': true,
    lastSeenAt: serverTimestamp(),
  });
  return getFiftyFiftyEliminations(question, selectedAnswer);
}

export async function usePhoneJoker(sessionId, playerId) {
  await updateDoc(playerRef(sessionId, playerId), {
    'jokersUsed.phone': true,
    lastSeenAt: serverTimestamp(),
  });
}

export async function useAudienceJoker(sessionId, playerId) {
  await updateDoc(playerRef(sessionId, playerId), {
    'jokersUsed.audience': true,
    lastSeenAt: serverTimestamp(),
  });
}

export const JOKER_META = {
  [JOKER_TYPES.FIFTY]: {
    icon: '✂️',
    label: '50:50',
    title: '50:50 Joker',
    description: 'Zwei falsche Antworten werden eliminiert. Klingt easy — ist es auch. Aber sicher bist du dir trotzdem nicht, oder?',
    confirmLabel: 'Zwei raus, zwei bleiben',
  },
  [JOKER_TYPES.PHONE]: {
    icon: '📞',
    label: 'Telefon',
    title: 'Telefonjoker',
    description: 'Ruf jetzt jemanden an oder frag eine Person in deiner Nähe. Du hast 30 Sekunden — oder so lange wie es dauert, bis die Person antwortet.',
    confirmLabel: 'Joker einlösen',
  },
  [JOKER_TYPES.AUDIENCE]: {
    icon: '👥',
    label: 'Publikum',
    title: 'Publikumsjoker',
    description: 'Sieh in Echtzeit, wie die anderen gerade abstimmen. Das Publikum hat nicht immer recht — aber meistens. Du entscheidest selbst, wann du deine Antwort abgibst.',
    confirmLabel: 'Abstimmung anzeigen',
  },
};
