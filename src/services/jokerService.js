import { db } from '../firebase/config.js';
import { doc, updateDoc, getDocs, getDoc, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { COLLECTIONS, JOKER_TYPES, ANSWERS } from '../utils/constants.js';
import { t } from './textService.js';

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

export async function useAudienceJoker(sessionId, playerId, questionId) {
  await updateDoc(playerRef(sessionId, playerId), {
    'jokersUsed.audience': true,
    lastSeenAt: serverTimestamp(),
  });

  if (!questionId) return;

  // Rebuild votes from all player answers — this is the authoritative snapshot
  // at joker-activation time. Overwrites the pre-created empty doc entirely.
  const playersSnap = await getDocs(
    collection(db, COLLECTIONS.SESSIONS, sessionId, 'players')
  );
  const votes = { A: 0, B: 0, C: 0, D: 0 };
  const voters = {};
  for (const p of playersSnap.docs) {
    const submitted = p.data().answers?.[questionId]?.submitted;
    if (submitted && ANSWERS.includes(submitted)) {
      votes[submitted] = (votes[submitted] || 0) + 1;
      voters[p.id] = submitted;
    }
  }
  const voteRef = doc(db, COLLECTIONS.SESSIONS, sessionId, 'audienceVotes', questionId);
  // Use setDoc without merge to fully overwrite — avoids stale data from
  // any prior increment() writes that used wrong dotted-key paths
  await setDoc(voteRef, { votes, voters, updatedAt: serverTimestamp() });
}

export function getJokerMeta() {
  return {
    [JOKER_TYPES.FIFTY]: {
      icon: '✂️',
      label: '50:50',
      title:        t('jokerFiftyTitle'),
      description:  t('jokerFiftyBody'),
      confirmLabel: t('jokerFiftyConfirm'),
    },
    [JOKER_TYPES.PHONE]: {
      icon: '📞',
      label: 'Telefon',
      title:        t('jokerPhoneTitle'),
      description:  t('jokerPhoneBody'),
      confirmLabel: t('jokerPhoneConfirm'),
    },
    [JOKER_TYPES.AUDIENCE]: {
      icon: '👥',
      label: 'Publikum',
      title:        t('jokerAudienceTitle'),
      description:  t('jokerAudienceBody'),
      confirmLabel: t('jokerAudienceConfirm'),
    },
  };
}

// Keep export name for backwards compat — evaluated lazily at call time
export const JOKER_META = new Proxy({}, {
  get(_, prop) { return getJokerMeta()[prop]; },
});
