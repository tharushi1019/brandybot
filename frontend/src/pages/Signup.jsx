import { useState } from "react";
import { signup } from "../auth";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      await signup(email, password, { firstName, lastName, phone });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-white overflow-hidden">

      {/* ⭐ Glassmorphism Card */}
      <div className="relative bg-white/70 backdrop-blur-lg border border-white/30 p-8 rounded-2xl shadow-2xl w-96">
        
        {/* ⭐ Logo watermark */}
      <img
        src="/brandybot_icon.png"
        alt="logo"
        className="absolute w-[420px] opacity-10 blur-sm select-none pointer-events-none"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Create Account
        </h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="text"
            placeholder="First Name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Last Name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white p-3 rounded-lg font-semibold transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 font-semibold hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
