import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { logoutUser } from '../services/authService';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "My Logos", path: "/logo_history", icon: "🖼" },
  { name: "Profile", path: "/profile", icon: "👤" },
  { name: "Settings", path: "/settings", icon: "⚙️" },
];

// Items shown in the mobile bottom nav bar
const bottomNavItems = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "My Logos", path: "/logo_history", icon: "🖼" },
  { name: "Logo Agent", path: "/logo-agent", icon: "✨" },
  { name: "Profile", path: "/profile", icon: "👤" },
  { name: "Settings", path: "/settings", icon: "⚙️" },
];

export default function DashboardLayout() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [credits, setCredits] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, [location.pathname]);

  const fetchCredits = async () => {
    try {
      const token = await user?.getIdToken();
      if (!token) return;
      const res = await axios.get(`${API}/credits`, { headers: { Authorization: `Bearer ${token}` } });
      setCredits(res.data.data?.balance);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  return (
    <div className="flex bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen font-sans">

      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden md:flex flex-shrink-0 flex-col border-r border-[var(--border-color)] transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} bg-[var(--bg-secondary)] relative z-20`}>
        <div className="p-5 flex-1 flex flex-col overflow-hidden">
          {/* Logo + collapse button */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white font-black text-xl">B</span>
              </div>
              <span className="font-black text-xl brand-gradient-text tracking-tight">Brandy<span className="text-purple-500">Bot</span></span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors text-xs flex-shrink-0"
              title="Collapse sidebar"
              style={{ color: 'var(--text-muted)' }}
            >
              ◀
            </button>
          </div>


          {/* New Chat CTA */}
          <Link to="/logo-agent" className="flex items-center justify-center gap-2 w-full py-3 mb-6 rounded-2xl brand-gradient text-white font-bold hover:scale-[1.02] hover:shadow-lg transition-all">
            ✨ Logo Agent
          </Link>

          {/* Credits */}
          {credits !== null && (
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl glass-card mb-8 border border-[var(--border-color)]">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Credits</span>
              <span className={`text-sm font-bold ${credits < 3 ? 'text-red-500' : 'text-purple-500'}`}>
                {credits} <Link to="/purchase" className="ml-1 text-xs opacity-70 hover:opacity-100">Buy</Link>
              </span>
            </div>
          )}

          {/* Nav Links */}
          <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "brand-gradient text-white shadow-md font-semibold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] font-medium"
                  }`}>
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer — user info + logout + theme */}
        <div className="p-5 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img
              src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-[var(--border-color)] bg-white flex-shrink-0"
            />
            <span className="text-sm font-medium truncate text-[var(--text-secondary)]">
              {user?.displayName || user?.email?.split('@')[0] || "User"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl border border-[var(--border-color)] hover:bg-red-500/10 hover:border-red-400/50 hover:text-red-400 transition-colors text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              🚪
            </button>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors text-sm"
              title="Toggle theme"
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] z-10 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center shadow">
              <span className="text-white font-black text-sm">B</span>
            </div>
            <span className="font-black brand-gradient-text tracking-tight">BrandyBot</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors">
              {isDark ? "☀️" : "🌙"}
            </button>
            <button onClick={handleLogout} title="Sign Out" className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm">
              🚪
            </button>
          </div>
        </header>

        {/* Hamburger — shown in top-left when sidebar is collapsed on desktop */}
        {!sidebarOpen && (
          <div className="hidden md:flex items-center px-4 py-3 border-b border-[var(--border-color)] flex-shrink-0 bg-[var(--bg-secondary)]">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors text-base"
              title="Open sidebar"
              style={{ color: 'var(--text-secondary)' }}
            >
              ☰
            </button>
          </div>
        )}


        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet context={{ credits, setCredits }} />
        </div>

        {/* ── Mobile Bottom Navigation Bar ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border-color)] flex"
          style={{ background: 'var(--bg-secondary)' }}>
          {bottomNavItems.map(item => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link key={item.path} to={item.path}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-purple-500' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}>
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
