import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyC1YvTQgbPpq81aJ3l6KAqwVRhF2fH9p0Q',
  authDomain:        'smartweekplanner-77584.firebaseapp.com',
  projectId:         'smartweekplanner-77584',
  storageBucket:     'smartweekplanner-77584.firebasestorage.app',
  messagingSenderId: '995772478548',
  appId:             '1:995772478548:web:eb8f25aa9efd94f269a9c1',
};

// Prevent duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth – use standard getAuth (works in Expo Go)
export const auth = getAuth(app);

// Firestore database
export const db = getFirestore(app);
