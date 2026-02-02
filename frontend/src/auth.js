import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Firestore imports

// Signup function - stores user details in Firestore
export const signup = async (email, password, { firstName, lastName, phone }) => {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store additional user details in Firestore
    await setDoc(doc(db, "users", user.uid), {
      firstName,
      lastName,
      phone,
      email,
      uid: user.uid, // Store the user's unique ID
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Login function
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};
