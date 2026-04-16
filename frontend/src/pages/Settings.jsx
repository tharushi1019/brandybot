import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { changePassword, logoutUser, isEmailPasswordUser } from "../services/authService";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const LOGO_STYLES = ["Modern", "Minimal", "Luxury", "Playful", "Bold", "Geometric"];
const INDUSTRIES = ["Technology", "Food & Beverage", "Fashion", "Healthcare", "Finance", "Education", "Real Estate", "Creative"];

/* ─── Sub-components ───────────────────────────────────────── */
const SettingsSection = ({ title, children, disabled, comingSoon }) => (
  <div className="p-5 rounded-2xl glass-card mb-4 relative overflow-hidden">
    <h2 className="font-bold mb-4 pb-3 border-b flex items-center gap-2" style={{ color: "var(--text-primary)", borderColor: "var(--border-color)" }}>
      {title}
      {comingSoon && (
        <span className="ml-2 px-2 py-0.5 text-xs rounded-full font-semibold"
          style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
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
  <label className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition hover:bg-[var(--bg-card-hover)]">
    <div>
      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
      {desc && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p>}
    </div>
    <div onClick={onChange} className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${checked ? "brand-gradient" : ""}`}
         style={!checked ? { background: "var(--border-color)" } : {}}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
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
    <div className="flex flex-col h-full w-full relative">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-6 py-4 md:pl-20 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex-shrink-0">
        <div>
          <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Settings</h1>
          <p className="text-sm text-[var(--text-muted)]">Customize your BrandyBot experience</p>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors text-sm" title="Toggle theme">
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto max-w-2xl mx-auto px-6 py-8 w-full space-y-4">

        {/* ── Appearance ── */}
        <SettingsSection title="🎨 Appearance">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Color Theme</p>
          <div className="flex gap-2">
            {[
              { value: "system", icon: "🖥", label: "System" },
              { value: "dark", icon: "🌙", label: "Dark" },
              { value: "light", icon: "☀️", label: "Light" },
            ].map(opt => (
              <button key={opt.value} onClick={() => setTheme(opt.value)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-semibold transition-all ${theme === opt.value ? "text-white shadow-md scale-[1.03]" : ""}`}
                style={theme === opt.value
                  ? { background: "var(--brand-gradient)", borderColor: "transparent" }
                  : { background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }
                }>
                <span className="text-lg">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            {theme === "system" ? "Follows your OS appearance." : theme === "dark" ? "Always dark mode." : "Always light mode."}
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
            <div style={{ opacity: prefs.aiPrefsEnabled ? 1 : 0.4, pointerEvents: prefs.aiPrefsEnabled ? "auto" : "none" }}>
              <div className="mb-4">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Default Logo Style</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {LOGO_STYLES.map(s => (
                    <button key={s} onClick={() => setPrefs(p => ({ ...p, defaultStyle: s }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${prefs.defaultStyle === s ? "brand-gradient text-white shadow-md" : "border text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"}`}
                      style={prefs.defaultStyle !== s ? { borderColor: "var(--border-color)" } : {}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Default Industry</label>
                <select value={prefs.defaultIndustry}
                  onChange={e => setPrefs(p => ({ ...p, defaultIndustry: e.target.value }))}
                  className="w-full mt-2 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleSavePrefs}
              className="w-full py-2.5 rounded-xl brand-gradient text-white text-sm font-semibold hover:opacity-90 transition">
              {prefsSaved ? "✓ Saved!" : prefsLoading ? "Loading..." : "Save AI Preferences"}
            </button>
          </div>
        </SettingsSection>

        {/* ── Notifications (Coming Soon) ── */}
        <SettingsSection title="🔔 Notifications" disabled comingSoon>
          <Toggle label="Email Updates" desc="Project updates and completions" checked={false} onChange={() => {}} />
          <Toggle label="Marketing Emails" desc="News and special offers" checked={false} onChange={() => {}} />
        </SettingsSection>

        {/* ── Credits & Billing ── */}
        <SettingsSection title="💎 Credits & Billing">
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Purchase credits to generate more logos and mockups.</p>
          <a href="/purchase" className="w-full py-2.5 rounded-xl brand-gradient text-white text-sm font-semibold hover:opacity-90 transition block text-center">
            View Plans & Buy Credits →
          </a>
        </SettingsSection>

        {/* ── Security (email/password users only) ── */}
        {isPasswordUser && (
          <SettingsSection title="🔐 Security">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Current Password</label>
                <input type="password" value={passwords.current}
                  onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                  placeholder="Enter current password"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>New Password</label>
                <input type="password" value={passwords.new}
                  onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                  placeholder="Enter new password"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Confirm New Password</label>
                <input type="password" value={passwords.confirm}
                  onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Confirm new password"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
              </div>
              {pwMsg && <p className={`text-xs ${pwMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>{pwMsg}</p>}
              <button onClick={handlePasswordChange}
                disabled={pwLoading || !passwords.new || !passwords.current}
                className="w-full py-2.5 rounded-xl brand-gradient text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-40">
                {pwLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </SettingsSection>
        )}

        {/* ── Sign Out ── */}
        <div className="flex gap-3">
          <button onClick={handleLogout}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition"
            style={{ color: "var(--text-secondary)" }}>
            Sign Out of All Sessions
          </button>
        </div>
      </div>
    </div>
  );
}
