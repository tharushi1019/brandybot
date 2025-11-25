import './App.css'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from "./pages/Dashboard.jsx";
import LogoGenerator from './components/LogoGenerator.jsx';
import BrandGuidelines from './components/BrandGuidelines.jsx';
import MockUpGenerator from './components/MockUpGenerator.jsx';
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (   
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> // Default Page
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='/logo_generator' element={<LogoGenerator/>} />
        <Route path='/brand_guidelines' element={<BrandGuidelines/>} />
        <Route path='/mockup_generator' element={<MockUpGenerator/>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  )
}

export default App
