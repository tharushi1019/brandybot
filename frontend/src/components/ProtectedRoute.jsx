import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute — wraps routes that require authentication.
 * 
 * Bug #12 fixed: while Firebase is resolving the auth state (loading = true),
 * we show nothing instead of immediately redirecting to /login.
 * This prevents the "flash of redirect" when a logged-in user refreshes the page.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Still waiting for Firebase to confirm auth state — show nothing (or a spinner)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
