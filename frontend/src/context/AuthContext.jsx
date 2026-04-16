import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // After a successful login, check if there's a guest chat to import and redirect
  const handlePostLoginHandoff = useCallback(async (firebaseUser) => {
    const handoffRaw = sessionStorage.getItem("brandybot-guest-handoff");
    if (!handoffRaw) return;

    try {
      const { messages } = JSON.parse(handoffRaw);
      if (!messages?.length) return;

      sessionStorage.removeItem("brandybot-guest-handoff");

      const token = await firebaseUser.getIdToken();
      const res = await axios.post(
        `${API}/chat/save-guest-session`,
        { messages },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sessionId = res.data?.data?.sessionId;
      if (sessionId) {
        // Navigate to Logo Agent with the restored session
        window.location.href = `/logo-agent?session=${sessionId}&from=guest`;
      }
    } catch (err) {
      console.error("Guest handoff failed:", err);
      // Still remove the stale handoff so it doesn't loop
      sessionStorage.removeItem("brandybot-guest-handoff");
    }
  }, []);

  useEffect(() => {
    let prevUser = null;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const wasLoggedOut = !prevUser;
      prevUser = currentUser;
      setUser(currentUser);
      setLoading(false);

      // Only run handoff on fresh login (not on page reload with existing session)
      if (currentUser && wasLoggedOut) {
        await handlePostLoginHandoff(currentUser);
      }
    });

    return () => unsubscribe();
  }, [handlePostLoginHandoff]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
