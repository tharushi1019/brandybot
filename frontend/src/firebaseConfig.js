import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Bug #11 fixed: Firebase config now reads from VITE_ environment variables
// so different environments (dev/staging/prod) can use different Firebase projects.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Note: Firestore (db) removed — user data is now stored in PostgreSQL (Supabase).
// The Firestore import was part of the old dual-write pattern (Bug #9).
export { auth };
