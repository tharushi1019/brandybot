import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getUserBrands } from "../services/guidelineService";
import { getLogoHistory } from "../services/logoService";
import { updateUserProfile } from "../services/authService";
import { logoutUser } from "../services/authService";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const StatBadge = ({ icon, label, value }) => (
  <div className="flex-1 p-4 rounded-2xl glass-card text-center">
    <div className="text-2xl mb-1">{icon}</div>
    <p className="text-xl font-black" style={{ color: "var(--text-primary)" }}>{value}</p>
    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
  </div>
);

export default function Profile() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  const [brands, setBrands] = useState([]);
  const [logos, setLogos] = useState([]);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [updating, setUpdating] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName || "");
    setPhotoURL(user.photoURL || "");
    const fetch = async () => {
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const [brandsRes, logosRes, creditsRes] = await Promise.allSettled([
          getUserBrands(),
          getLogoHistory(1, 6),
          axios.get(`${API}/credits`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setBrands(brandsRes.status === "fulfilled" ? brandsRes.value.data || [] : []);
        setLogos(logosRes.status === "fulfilled" ? logosRes.value.data || [] : []);
        setCredits(creditsRes.status === "fulfilled" ? creditsRes.value?.data?.data?.balance ?? 50 : null);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const handleSave = async () => {
    setUpdating(true);
    try {
      await updateUserProfile({ displayName, photoURL });
      setSaveMsg("Profile updated! ✓");
      setIsEditing(false);
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e) {
      setSaveMsg("Save failed: " + e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure? This action is PERMANENT and cannot be undone.")) {
      try {
        const token = await user.getIdToken();
        await axios.delete(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
        await logoutUser();
        navigate("/");
      } catch (e) { alert("Delete failed: " + e.message); }
    }
  };

  const joined = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Contextual Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 md:pl-20 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex-shrink-0">
        <div>
          <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Your Profile</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage your account and brand history</p>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto px-6 py-10 w-full">

        {/* Avatar Card */}
        <div className="p-6 rounded-3xl mb-6 glass-card" style={{ border: "1px solid var(--border-color)" }}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={isEditing && photoURL ? photoURL : (user?.photoURL || defaultAvatar)}
                alt="avatar"
                onError={e => e.target.src = defaultAvatar}
                className="w-24 h-24 rounded-3xl object-cover shadow-xl"
                style={{ border: "3px solid var(--border-focus)" }}
              />
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl brand-gradient flex items-center justify-center text-white text-xs shadow-lg">
                ✓
              </div>
            </div>

            {/* Info / Edit */}
            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <div className="space-y-3 max-w-sm">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Display Name</label>
                    <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Photo URL</label>
                    <input value={photoURL} onChange={e => setPhotoURL(e.target.value)} placeholder="https://..."
                      className="w-full mt-1 px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>Cancel</button>
                    <button onClick={handleSave} disabled={updating} className="px-5 py-2 text-sm rounded-xl brand-gradient text-white font-semibold hover:opacity-90 disabled:opacity-50">
                      {updating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                  {saveMsg && <p className="text-xs text-green-400">{saveMsg}</p>}
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
                    {user?.displayName || "User"}
                  </h2>
                  <p className="mt-0.5 text-sm" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Member since {joined}</p>
                  <button onClick={() => setIsEditing(true)} className="mt-3 px-4 py-1.5 rounded-xl text-xs font-semibold brand-gradient text-white hover:opacity-90 transition shadow-md">
                    ✏️ Edit Profile
                  </button>
                  {saveMsg && <p className="text-xs text-green-400 mt-2">{saveMsg}</p>}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 mb-6">
          <StatBadge icon="🎨" label="Logos Made" value={logos.length} />
          <StatBadge icon="🏷"  label="Brands"    value={brands.length} />
          <StatBadge icon="💎" label="Credits"    value={credits !== null ? credits : "—"} />
        </div>

        {/* Recent Logos */}
        {logos.length > 0 && (
          <div className="p-5 rounded-2xl glass-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Recent Logos</h3>
              <Link to="/logo_history" className="text-xs text-purple-400 hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {logos.slice(0, 6).map(l => (
                <div key={l.id} className="aspect-square rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-color)" }}>
                  <img src={l.logo_url} alt={l.brand_name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Brands */}
        {brands.length > 0 && (
          <div className="p-5 rounded-2xl glass-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Recent Brands</h3>
              <Link to="/dashboard" className="text-xs text-purple-400 hover:underline">All brands →</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {brands.slice(0, 6).map(b => (
                <div key={b.id} className="flex-shrink-0 p-3 rounded-xl glass-card text-center w-28">
                  <img src={b.logo?.primaryLogoUrl || "/brandybot_icon.png"} alt={b.brand_name}
                    className="w-12 h-12 object-contain rounded-lg mx-auto mb-2" />
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{b.brand_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="p-5 rounded-2xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <h3 className="font-bold text-red-400 mb-1">Danger Zone</h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Permanently delete your account and all associated data. This cannot be undone.</p>
          <button onClick={handleDeleteAccount}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/20 transition">
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}
