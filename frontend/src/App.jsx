import "././App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard.jsx";
import LogoHistory from "./pages/LogoHistory";
import BrandGuidelines from "./pages/BrandGuidelines.jsx";
import MockUpGenerator from "./pages/MockUpGenerator.jsx";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import LogoAgent from "./pages/LogoAgent.jsx";
import PurchasePage from "./pages/PurchasePage.jsx";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes Without Layout */}
        <Route path="/logo-agent" element={<ProtectedRoute><LogoAgent /></ProtectedRoute>} />

        {/* Protected Routes With Dashboard Layout */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/logo_history" element={<LogoHistory />} />
          <Route path="/brand_guidelines" element={<BrandGuidelines />} />
          <Route path="/mockup_generator" element={<MockUpGenerator />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/purchase" element={<PurchasePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
