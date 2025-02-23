import './App.css'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from "./pages/Dashboard.jsx";

function App() {
  return (   
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> // Default Page
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
