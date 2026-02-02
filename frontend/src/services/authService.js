import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

export const logoutUser = async () => {
  await signOut(auth);
};
