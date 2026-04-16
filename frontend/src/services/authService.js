import { signOut, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../firebaseConfig";

export const logoutUser = async () => {
  await signOut(auth);
};

export const updateUserProfile = async (updates) => {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, updates);
  }
};

/**
 * Change the current user's password.
 * Firebase requires re-authentication before updating the password.
 * @param {string} currentPassword - User's current password for verification
 * @param {string} newPassword - The new password to set
 */
export const changePassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found.");
  if (!user.email) throw new Error("Cannot change password for this account type.");

  // Re-authenticate first — Firebase requires this for sensitive operations
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Now safe to update the password
  await updatePassword(user, newPassword);
};

/**
 * Check if the current user signed in with email/password (not Google/social)
 */
export const isEmailPasswordUser = () => {
  const user = auth.currentUser;
  if (!user) return false;
  return user.providerData.some(p => p.providerId === "password");
};
