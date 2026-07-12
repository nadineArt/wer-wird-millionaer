import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyCO5Ln5vvWh5u63Mp5BFG6bwy7DduhxBhs',
  authDomain:        'wer-wird-millionaer-cf31b.firebaseapp.com',
  projectId:         'wer-wird-millionaer-cf31b',
  storageBucket:     'wer-wird-millionaer-cf31b.firebasestorage.app',
  messagingSenderId: '1032073656307',
  appId:             '1:1032073656307:web:b321a8019b900d21d2c486',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
