import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getLogoHistory } from "../services/logoService";
import { logoutUser } from "../services/authService";
import BrandGuidelinesModal from "../components/BrandGuidelinesModal";
import MockupModal from "../components/MockupModal";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const resolveUrl = (url) => {
  if (!url || url === "processing...") return null;
  if (url.startsWith("data:") || url.startsWith("http")) return url;
  const base = API.replace("/api", "");
  return `${base}${url}`;
};

/* ─── Sidebar Nav Item ─────────────────────────────────── */
const NavItem = ({ to, icon, label, active, danger = false }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
      active
        ? "brand-gradient text-white shadow-lg"
        : danger
        ? "text-red-400 hover:bg-red-500/10"
        : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
    }`}
  >
    <span className="text-base">{icon}</span>
    <span>{label}</span>
  </Link>
);

/* ─── Stat Card ───────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, colorClass }) => (
  <div
    className="p-5 rounded-2xl flex items-center gap-4 transition-all hover:-translate-y-1 glass-card"
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  </div>
);

/* ─── Logo Card (replaces BrandCard) ────────────────────── */
const LogoCard = ({ logo, onGuidelines, onMockup }) => {
  const imgUrl = resolveUrl(logo.logo_url);
  const isCompleted = logo.status === "completed" && imgUrl;
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:shadow-lg glass-card group">
      <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
           style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
        {isCompleted
          ? <img src={imgUrl} alt={logo.brand_name} className="w-full h-full object-contain p-1" onError={e => { e.target.style.display="none"; }} />
          : <span className="text-2xl">{logo.status === "failed" ? "❌" : "⏳"}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold truncate text-sm" style={{ color: "var(--text-primary)" }}>{logo.brand_name}</h3>
        <p className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
          {logo.style} · {logo.created_at ? new Date(logo.created_at).toLocaleDateString() : ""}
        </p>
      </div>
      {isCompleted && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onGuidelines(logo)} title="Brand Guidelines"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm hover:bg-purple-500/20 transition" >📋</button>
          <button onClick={() => onMockup(logo)} title="Mockups"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm hover:bg-blue-500/20 transition">👕</button>
        </div>
      )}
    </div>
  );
};

/* ─── Quick Action Card ──────────────────────────────── */
const QuickAction = ({ to, icon, label, desc, gradientColors }) => (
  <Link
    to={to}
    className="p-5 rounded-2xl group transition-all hover:-translate-y-1 glass-card"
  >
    <div className={`w-12 h-12 rounded-2xl mb-3 flex items-center justify-center text-2xl bg-gradient-to-br ${gradientColors} shadow-lg group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <p className="font-bold text-sm mb-0.5" style={{ color: "var(--text-primary)" }}>{label}</p>
    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p>
  </Link>
);

/* ─── Dashboard Page ─────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ logos: 0, brands: 0, credits: 50 });
  const [recentLogos, setRecentLogos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [guidelinesModal, setGuidelinesModal] = useState({ open: false, logo: null });
  const [mockupModal, setMockupModal] = useState({ open: false, logo: null });

  const openGuidelines = (logo) => setGuidelinesModal({ open: true, logo: { ...logo, logo_url: resolveUrl(logo.logo_url) } });
  const openMockup    = (logo) => setMockupModal({ open: true, logo: { ...logo, logo_url: resolveUrl(logo.logo_url) } });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [logosRes, creditsRes] = await Promise.allSettled([
          getLogoHistory(1, 6),
          user.getIdToken().then(token =>
            axios.get(`${API}/credits`, { headers: { Authorization: `Bearer ${token}` } })
          )
        ]);

        const logos = logosRes.status === "fulfilled" ? logosRes.value.data || [] : [];
        const logoCount = logosRes.status === "fulfilled"
          ? logosRes.value.pagination?.total ?? logos.length : 0;
        const creditBalance = creditsRes.status === "fulfilled"
          ? creditsRes.value?.data?.data?.balance ?? 50 : 50;

        setRecentLogos(logos);
        setStats({ logos: logoCount, brands: logos.length, credits: creditBalance });
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filtered = recentLogos.filter(l =>
    (l.brand_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Bar for Dashboard specific welcome */}
      <div className="flex items-center justify-between px-6 py-4 md:pl-20 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex-shrink-0">
        <div>
          <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
            Welcome back, {user?.displayName?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-sm text-[var(--text-muted)]">Here's your brand workspace overview</p>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
             <div className="w-10 h-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard icon="🎨" label="Logos Generated" value={stats.logos}   colorClass="bg-purple-500/20 text-purple-400" />
              <StatCard icon="🏷"  label="Active Brands"   value={stats.brands}  colorClass="bg-blue-500/20 text-blue-400" />
              <StatCard icon="💎" label="Credits"          value={stats.credits} sub={stats.credits < 10 ? "Low — buy more!" : "Available"} colorClass="bg-amber-500/20 text-amber-400" />
            </div>

            {/* Quick Actions */}
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-[var(--text-muted)] mt-8">Quick Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <QuickAction to="/logo-agent"   icon="🤖" label="Logo Agent"    desc="Chat your way to a logo"   gradientColors="from-purple-600 to-blue-500" />
              <QuickAction to="/logo_history" icon="🖼"  label="My Logos"      desc="All generated logos"       gradientColors="from-pink-600 to-purple-600" />
              <QuickAction to="/purchase"     icon="💎" label="Buy Credits"   desc="Power up your account"     gradientColors="from-amber-500 to-orange-500" />
            </div>

            {/* Brands */}
            <div className="p-5 rounded-2xl glass-card mt-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-lg font-black text-[var(--text-primary)]">Your Brands</h2>
                <div className="relative">
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search brands..."
                    className="pl-4 pr-9 py-2 rounded-xl text-sm outline-none transition bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-purple-500"
                  />
                  <span className="absolute right-3 top-2 text-[var(--text-muted)] text-sm">🔍</span>
                </div>
              </div>

              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered.map(l => (
                    <LogoCard
                      key={l.id}
                      logo={l}
                      onGuidelines={openGuidelines}
                      onMockup={openMockup}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-14 rounded-2xl border-2 border-dashed border-[var(--border-color)]">
                  <p className="text-4xl mb-3">🚀</p>
                  <p className="font-semibold mb-1 text-[var(--text-primary)]">No logos yet</p>
                  <p className="text-sm mb-4 text-[var(--text-muted)]">Chat with the Logo Agent to create your first brand</p>
                  <Link to="/logo-agent" className="px-6 py-2.5 rounded-xl brand-gradient text-white text-sm font-semibold hover:opacity-90 transition inline-block">
                    Start Creating →
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Inline Modals */}
      {guidelinesModal.open && (
        <BrandGuidelinesModal
          logo={guidelinesModal.logo}
          brandContext={{ brandName: guidelinesModal.logo?.brand_name, industry: guidelinesModal.logo?.industry }}
          onClose={() => setGuidelinesModal({ open: false, logo: null })}
        />
      )}
      {mockupModal.open && (
        <MockupModal
          logo={mockupModal.logo}
          onClose={() => setMockupModal({ open: false, logo: null })}
        />
      )}
    </div>
  );
};

export default Dashboard;
