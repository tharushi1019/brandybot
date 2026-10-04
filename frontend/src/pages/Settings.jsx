import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { changePassword, logoutUser, isEmailPasswordUser } from "../services/authService";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const LOGO_STYLES = ["Modern", "Minimal", "Luxury", "Playful", "Bold", "Geometric"];
const INDUSTRIES = ["Technology", "Food & Beverage", "Fashion", "Healthcare", "Finance", "Education", "Real Estate", "Creative"];

/* ─── Sub-components ───────────────────────────────────────── */
const SettingsSection = ({ title, children, disabled, comingSoon, className = "" }) => (
  <div className={`p-6 rounded-3xl glass-card relative overflow-hidden border border-[var(--border-color)] shadow-sm ${className}`}>
    <h2 className="font-bold text-base mb-5 pb-3.5 border-b flex items-center justify-between" style={{ color: "var(--text-primary)", borderColor: "var(--border-color)" }}>
      <span className="flex items-center gap-2">{title}</span>
      {comingSoon && (
        <span className="px-2.5 py-0.5 text-[11px] rounded-full font-bold uppercase tracking-wider border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-300">
          Coming Soon
        </span>
      )}
    </h2>
    <div style={{ opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      {children}
    </div>
  </div>
);

const Toggle = ({ label, desc, checked, onChange }) => (
  <label className="flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition hover:bg-[var(--bg-card-hover)] border border-transparent hover:border-[var(--border-color)]">
    <div>
      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
      {desc && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>}
    </div>
    <div onClick={onChange} className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${checked ? "brand-gradient" : ""}`}
         style={!checked ? { background: "var(--border-color)" } : {}}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </div>
  </label>
);

/* ─── Main Settings Page ───────────────────────────────── */
export default function Settings() {
  const { user } = useAuth();
  const { isDark, theme, setTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isPasswordUser = isEmailPasswordUser();

  // Security (password change)
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  // AI Preferences
  const [prefs, setPrefs] = useState({
    defaultStyle: "Modern",
    defaultIndustry: "Technology",
    aiPrefsEnabled: true,
  });
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsSaved, setPrefsSaved] = useState(false);

  /* Fetch AI prefs from backend on mount */
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const token = await user?.getIdToken?.();
        if (!token) return;
        const res = await axios.get(`${API}/users/preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.data) {
          setPrefs(p => ({ ...p, ...res.data.data }));
        }
      } catch (e) {
        // Use defaults silently
      } finally {
        setPrefsLoading(false);
      }
    };
    loadPrefs();
  }, [user]);

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) return setPwMsg("Passwords do not match.");
    if (passwords.new.length < 6) return setPwMsg("Password must be at least 6 characters.");
    if (!passwords.current) return setPwMsg("Please enter your current password.");
    setPwLoading(true);
    try {
      await changePassword(passwords.current, passwords.new);
      setPwMsg("✓ Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (e) {
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        setPwMsg("Current password is incorrect.");
      } else {
        setPwMsg("Failed: " + e.message);
      }
    } finally {
      setPwLoading(false);
      setTimeout(() => setPwMsg(null), 5000);
    }
  };

  const handleSavePrefs = async () => {
    try {
      const token = await user?.getIdToken?.();
      await axios.patch(`${API}/users/preferences`, prefs, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 3000);
    } catch (e) {
      console.error("Failed to save prefs:", e.message);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div className="w-full min-h-full">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] sticky top-0 z-10">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">Settings</h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">Customize your BrandyBot experience and AI preferences</p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors text-sm shadow-sm"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>

      {/* ── Settings Content Container (Responsive Desktop & Mobile Grid) ── */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column (Primary Settings: Appearance & AI Preferences & Security) */}
          <div className="lg:col-span-7 space-y-6">

            {/* ── Appearance ── */}
            <SettingsSection title="🎨 Appearance">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Color Theme
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "system", icon: "🖥", label: "System" },
                  { value: "dark", icon: "🌙", label: "Dark" },
                  { value: "light", icon: "☀️", label: "Light" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-2xl border text-xs font-bold transition-all ${
                      theme === opt.value
                        ? "text-white shadow-lg shadow-purple-500/20 scale-[1.02]"
                        : "hover:bg-[var(--bg-card-hover)] hover:border-purple-500/30"
                    }`}
                    style={
                      theme === opt.value
                        ? { background: "var(--brand-gradient)", borderColor: "transparent" }
                        : { background: "var(--bg-input)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }
                    }
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs mt-3.5 font-medium" style={{ color: "var(--text-muted)" }}>
                {theme === "system" ? "Follows your operating system appearance." : theme === "dark" ? "Always dark mode." : "Always light mode."}
              </p>
            </SettingsSection>

            {/* ── AI Preferences ── */}
            <SettingsSection title="🤖 AI Preferences">
              <div className="space-y-4">
                <Toggle
                  label="Enable AI Preferences"
                  desc="Use your default style and industry when generating logos"
                  checked={prefs.aiPrefsEnabled}
                  onChange={() => setPrefs(p => ({ ...p, aiPrefsEnabled: !p.aiPrefsEnabled }))}
                />

                <div className="pt-2 border-t border-[var(--border-color)]" style={{ opacity: prefs.aiPrefsEnabled ? 1 : 0.45, pointerEvents: prefs.aiPrefsEnabled ? "auto" : "none" }}>
                  <div className="mb-5">
                    <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: "var(--text-muted)" }}>
                      Default Logo Style
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {LOGO_STYLES.map(s => (
                        <button
                          key={s}
                          onClick={() => setPrefs(p => ({ ...p, defaultStyle: s }))}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            prefs.defaultStyle === s
                              ? "brand-gradient text-white shadow-md scale-105"
                              : "border text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:border-purple-500/30"
                          }`}
                          style={prefs.defaultStyle !== s ? { borderColor: "var(--border-color)", background: "var(--bg-input)" } : {}}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: "var(--text-muted)" }}>
                      Default Industry
                    </label>
                    <select
                      value={prefs.defaultIndustry}
                      onChange={e => setPrefs(p => ({ ...p, defaultIndustry: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold outline-none transition focus:border-purple-500 cursor-pointer"
                      style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                    >
                      {INDUSTRIES.map(i => (
                        <option key={i} value={i} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSavePrefs}
                  className="w-full py-3 rounded-xl brand-gradient text-white text-sm font-bold hover:opacity-95 hover:shadow-lg hover:shadow-purple-500/25 transition shadow-md"
                >
                  {prefsSaved ? "✓ Preferences Saved!" : prefsLoading ? "Loading..." : "Save AI Preferences"}
                </button>
              </div>
            </SettingsSection>

            {/* ── Security (email/password users only) ── */}
            {isPasswordUser && (
              <SettingsSection title="🔐 Security">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwords.current}
                      onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                      placeholder="Enter current password"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition focus:border-purple-500"
                      style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwords.new}
                      onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                      placeholder="Enter new password (min. 6 characters)"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition focus:border-purple-500"
                      style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                      placeholder="Confirm new password"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition focus:border-purple-500"
                      style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                    />
                  </div>

                  {pwMsg && (
                    <p className={`text-xs font-bold px-3 py-2 rounded-xl ${pwMsg.startsWith("✓") ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                      {pwMsg}
                    </p>
                  )}

                  <button
                    onClick={handlePasswordChange}
                    disabled={pwLoading || !passwords.new || !passwords.current}
                    className="w-full py-3 rounded-xl brand-gradient text-white text-sm font-bold hover:opacity-95 hover:shadow-lg hover:shadow-purple-500/25 transition shadow-md disabled:opacity-40"
                  >
                    {pwLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </SettingsSection>
            )}

          </div>

          {/* Right Column (Billing, Notifications, Account Management) */}
          <div className="lg:col-span-5 space-y-6">

            {/* ── Credits & Billing ── */}
            <SettingsSection title="💎 Credits & Billing">
              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
                Purchase credits to generate more professional logos, complete brand guidelines, and 3D mockups.
              </p>
              <Link
                to="/purchase"
                className="w-full py-3.5 rounded-2xl brand-gradient text-white text-sm font-bold hover:opacity-95 hover:shadow-lg hover:shadow-purple-500/30 transition block text-center shadow-md"
              >
                View Plans & Buy Credits →
              </Link>
            </SettingsSection>

            {/* ── Notifications (Coming Soon) ── */}
            <SettingsSection title="🔔 Notifications" disabled comingSoon>
              <div className="space-y-1">
                <Toggle label="Email Updates" desc="Project updates and completions" checked={false} onChange={() => {}} />
                <Toggle label="Marketing Emails" desc="News, AI updates, and special offers" checked={false} onChange={() => {}} />
              </div>
            </SettingsSection>

            {/* ── Session & Sign Out ── */}
            <div className="p-6 rounded-3xl glass-card border border-[var(--border-color)] shadow-sm">
              <h3 className="font-bold text-sm mb-1.5" style={{ color: "var(--text-primary)" }}>Session Security</h3>
              <p className="text-xs mb-5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Sign out of your active session on this device.
              </p>
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-2xl text-sm font-bold border border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-colors flex items-center justify-center gap-2"
              >
                <span>🚪</span>
                <span>Sign Out of All Sessions</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
