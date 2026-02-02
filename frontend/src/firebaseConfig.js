import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDoB841yeOMZDv2xz-GYqtafyCaO7tCLyU",
    authDomain: "brandybot-b0534.firebaseapp.com",
    projectId: "brandybot-b0534",
    storageBucket: "brandybot-b0534.firebasestorage.app",
    messagingSenderId: "587918200353",
    appId: "1:587918200353:web:8dba65b147b9ba18299d60",
    measurementId: "G-H6F48T3EWN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
