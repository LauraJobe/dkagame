import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Web config for the dkagame Firebase project. These values identify the
// project; they are not secrets. Access is controlled by database.rules.json.
// Analytics is intentionally not loaded: the game collects no tracking data.
const firebaseConfig = {
  apiKey: 'AIzaSyDerrx11KmEW7N_LlQGGy_TnQq5MvivvyU',
  authDomain: 'dkagame-1a95a.firebaseapp.com',
  databaseURL: 'https://dkagame-1a95a-default-rtdb.firebaseio.com',
  projectId: 'dkagame-1a95a',
  storageBucket: 'dkagame-1a95a.firebasestorage.app',
  messagingSenderId: '656532642685',
  appId: '1:656532642685:web:af20fd904ee922d827ca14',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Resolves with the anonymous user's uid. No names or emails are ever collected.
export function ensureSignedIn() {
  return new Promise((resolve, reject) => {
    const off = onAuthStateChanged(auth, (user) => {
      if (user) {
        off();
        resolve(user.uid);
      }
    });
    signInAnonymously(auth).catch((err) => {
      off();
      reject(err);
    });
  });
}
