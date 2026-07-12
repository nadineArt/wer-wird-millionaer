// Seeds 13 test questions into the "Max" game in Firestore.
// Run with: node scripts/seed_questions.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:   'AIzaSyCO5Ln5vvWh5u63Mp5BFG6bwy7DduhxBhs',
  projectId: 'wer-wird-millionaer-cf31b',
  appId:    '1:1032073656307:web:b321a8019b900d21d2c486',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const QUESTIONS = [
  {
    stage: 1,
    text: 'Was ist Max liebste Freizeitbeschaeftigung?',
    options: { A: 'Zocken', B: 'Kochen', C: 'Schlafen', D: 'Sport' },
    correctAnswer: 'A',
  },
  {
    stage: 2,
    text: 'Welches Tier wuerde Max am ehesten als Haustier waehlen?',
    options: { A: 'Hund', B: 'Katze', C: 'Hamster', D: 'Schlange' },
    correctAnswer: 'A',
  },
  {
    stage: 3,
    text: 'Was bestellt Max fast immer wenn er Pizza bestellt?',
    options: { A: 'Margherita', B: 'Salami', C: 'Hawaii', D: 'Vier Kaese' },
    correctAnswer: 'B',
  },
  {
    stage: 4,
    text: 'Welche Serie hat Max zuletzt gebingt?',
    options: { A: 'Breaking Bad', B: 'Stranger Things', C: 'The Office', D: 'Game of Thrones' },
    correctAnswer: 'C',
  },
  {
    stage: 5,
    text: 'Was wuerde Max mit 1.000 Euro sofort kaufen?',
    options: { A: 'Reise', B: 'Technik', C: 'Klamotten', D: 'Sparen' },
    correctAnswer: 'B',
  },
  {
    stage: 6,
    text: 'Welches Fach mochte Max in der Schule am wenigsten?',
    options: { A: 'Mathe', B: 'Sport', C: 'Deutsch', D: 'Kunst' },
    correctAnswer: 'A',
  },
  {
    stage: 7,
    text: 'Was ist Max absolutes Lieblingsessen?',
    options: { A: 'Burger', B: 'Sushi', C: 'Pasta', D: 'Schnitzel' },
    correctAnswer: 'D',
  },
  {
    stage: 8,
    text: 'Wohin wuerde Max am liebsten in den Urlaub fahren?',
    options: { A: 'Japan', B: 'Malle', C: 'New York', D: 'Skandinavien' },
    correctAnswer: 'C',
  },
  {
    stage: 9,
    text: 'Was ist das erste was Max morgens macht?',
    options: { A: 'Kaffee kochen', B: 'Handy checken', C: 'Duschen', D: 'Fruehstuecken' },
    correctAnswer: 'B',
  },
  {
    stage: 10,
    text: 'Welcher Superheld waere Max am liebsten?',
    options: { A: 'Spider-Man', B: 'Batman', C: 'Iron Man', D: 'Thor' },
    correctAnswer: 'C',
  },
  {
    stage: 11,
    text: 'Was sagt Max am haeufigsten wenn etwas schieflaeuft?',
    options: { A: 'Alter...', B: 'Kein Stress', C: 'Typisch', D: 'Schon wieder' },
    correctAnswer: 'A',
  },
  {
    stage: 12,
    text: 'Welchen Job haette Max in einem anderen Leben?',
    options: { A: 'Pilot', B: 'YouTuber', C: 'Koch', D: 'Forscher' },
    correctAnswer: 'B',
  },
  {
    stage: 13,
    text: 'Was wuerde Max auf einer einsamen Insel am meisten vermissen?',
    options: { A: 'WLAN', B: 'Menschen', C: 'Musik', D: 'Essen' },
    correctAnswer: 'A',
  },
];

const gamesSnap = await getDocs(query(collection(db, 'games'), where('title', '==', 'Max')));
if (gamesSnap.empty) {
  console.error('Kein Spiel mit dem Titel "Max" gefunden. Bitte erst im Admin-Cockpit anlegen.');
  process.exit(1);
}

const gameId = gamesSnap.docs[0].id;
console.log('Spiel gefunden: ' + gameId);

const existingSnap = await getDocs(collection(db, 'games', gameId, 'questions'));
const existingCount = existingSnap.size;
const startOrder = existingCount + 1;
const toAdd = QUESTIONS.slice(existingCount);

if (toAdd.length === 0) {
  console.log('Bereits ' + existingCount + ' Fragen vorhanden — nichts zu tun.');
  process.exit(0);
}

console.log('Vorhandene Fragen: ' + existingCount + ' — fuege ' + toAdd.length + ' hinzu...');

for (let i = 0; i < toAdd.length; i++) {
  const q = toAdd[i];
  await addDoc(collection(db, 'games', gameId, 'questions'), {
    ...q,
    order: startOrder + i,
    createdAt: serverTimestamp(),
  });
  console.log('Frage ' + (startOrder + i) + ' angelegt');
}

console.log('\nFertig! 13 Testfragen angelegt.');
process.exit(0);
