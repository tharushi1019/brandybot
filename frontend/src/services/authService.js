import { signOut, updateProfile, updatePassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

export const logoutUser = async () => {
  await signOut(auth);
};

export const updateUserProfile = async (updates) => {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, updates);
  }
};

export const changePassword = async (newPassword) => {
  if (auth.currentUser) {
    await updatePassword(auth.currentUser, newPassword);
  }
};
