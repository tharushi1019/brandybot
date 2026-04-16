import { useState } from "react";
import { signup } from "../auth";
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useTheme } from "../context/ThemeContext";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signup(email, password);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "var(--auth-input-bg)",
    border: "1px solid var(--auth-input-border)",
    color: "var(--auth-input-text)",
  };

  return (
    <div
      className="relative flex justify-center items-center min-h-screen overflow-hidden"
      style={{ background: "var(--auth-bg)" }}
    >
      {/* Brand gradient orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
           style={{ background: "var(--brand-gradient)" }} />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
           style={{ background: "linear-gradient(to right, #ec4899, #7c3aed)" }} />

      {/* Card */}
      <div
        className="relative backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-96 z-10"
        style={{
          background: "var(--auth-card-bg)",
          border: "1px solid var(--auth-card-border)",
        }}
      >
        {/* Logo watermark */}
        <img
          src="/brandybot_icon.png"
          alt="logo"
          className="absolute w-[420px] opacity-[0.04] blur-sm select-none pointer-events-none"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
               style={{ background: "var(--brand-gradient)" }}>
            <span className="text-white font-black text-lg">B</span>
          </div>
          <span className="font-black text-xl brand-gradient-text">BrandyBot</span>
        </div>

        <h2 className="text-2xl font-bold text-center mb-1" style={{ color: "var(--text-primary)" }}>
          Create Account
        </h2>
        <p className="text-sm text-center mb-5" style={{ color: "var(--text-muted)" }}>
          Start building your brand with AI
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-center"
               style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", color: "var(--accent-error)" }}>
            {error}
          </div>
        )}

        {/* Google Sign-Up Button */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 p-3 rounded-xl font-semibold transition mb-4 disabled:opacity-60"
          style={{
            background: "var(--auth-google-bg)",
            border: "1px solid var(--auth-google-border)",
            color: "var(--auth-google-text)",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--auth-google-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--auth-google-bg)"}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: "var(--auth-divider)" }} />
          <span className="text-sm" style={{ color: "var(--auth-divider-text)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--auth-divider)" }} />
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 rounded-xl outline-none transition"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
            onBlur={e => e.target.style.borderColor = "var(--auth-input-border)"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-xl outline-none transition"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
            onBlur={e => e.target.style.borderColor = "var(--auth-input-border)"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 rounded-xl outline-none transition"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "var(--border-focus)"}
            onBlur={e => e.target.style.borderColor = "var(--auth-input-border)"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-xl font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ background: "var(--brand-gradient)" }}
          >
            {loading ? "Creating Account…" : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center mt-5" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: "var(--brand-primary)" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
