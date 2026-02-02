import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard.jsx";
import LogoGenerator from "./pages/LogoGenerator";
import BrandGuidelines from "./pages/BrandGuidelines.jsx";
import MockUpGenerator from "./pages/MockUpGenerator.jsx";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logo_generator"
          element={
            <ProtectedRoute>
              <LogoGenerator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/brand_guidelines"
          element={
            <ProtectedRoute>
              <BrandGuidelines />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mockup_generator"
          element={
            <ProtectedRoute>
              <MockUpGenerator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
