import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TEMPLATES = [
  { id: 'business_card', label: 'Business Card', icon: '💼', desc: '3.5" × 2" standard card' },
  { id: 'tshirt',        label: 'T-Shirt',       icon: '👕', desc: 'Chest logo placement' },
  { id: 'mug',           label: 'Mug',            icon: '☕', desc: '11oz classic mug' },
  { id: 'website_hero',  label: 'Website Hero',   icon: '🖥️', desc: '1200px website header' },
  { id: 'social_banner', label: 'Social Banner',  icon: '📱', desc: '1080×1080 social media' },
];

const MockupModal = ({ logo, onClose }) => {
  const { user } = useAuth();
  // Map of template id → { url, loading, error }
  const [mockups, setMockups] = useState(() =>
    Object.fromEntries(TEMPLATES.map(t => [t.id, { url: null, loading: false, error: null }]))
  );
  const [selected, setSelected] = useState('business_card');
  const [zipLoading, setZipLoading] = useState(false);

  const getToken = async () => user?.getIdToken ? await user.getIdToken() : null;

  const generateOne = async (templateId) => {
    setMockups(prev => ({ ...prev, [templateId]: { url: null, loading: true, error: null } }));
    try {
      const token = await getToken();
      const res = await axios.post(
        `${API}/mockups/generate`,
        {
          templateType: templateId,          // controller accepts templateType
          logoUrl: logo?.logo_url || null,
          brandName: logo?.brand_name || 'Brand',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const url = res.data.data?.mockupUrl || res.data.data?.url || null;
      setMockups(prev => ({ ...prev, [templateId]: { url, loading: false, error: null } }));
    } catch (e) {
      const msg = e.response?.data?.message || 'Generation failed';
      setMockups(prev => ({ ...prev, [templateId]: { url: null, loading: false, error: msg } }));
    }
  };

  // Generate all templates in parallel on mount
  useEffect(() => {
    TEMPLATES.forEach(t => generateOne(t.id));
  }, []);

  const handleDownloadOne = () => {
    const url = mockups[selected]?.url;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${logo?.brand_name || 'mockup'}-${selected}.png`;
    a.click();
  };

  const handleDownloadAll = async () => {
    const ready = TEMPLATES.filter(t => mockups[t.id]?.url);
    if (!ready.length) return;
    setZipLoading(true);
    try {
      const [{ default: JSZip }, { default: saveAs }] = await Promise.all([
        import('jszip'),
        import('file-saver')
      ]);
      const zip = new JSZip();
      const folder = zip.folder(`${logo?.brand_name || 'brand'}_mockups`);

      await Promise.all(ready.map(async t => {
        const url = mockups[t.id].url;
        try {
          const resp = await fetch(url);
          const blob = await resp.blob();
          folder.file(`${t.id}.png`, blob);
        } catch (_) { /* skip failed */ }
      }));

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${(logo?.brand_name || 'brand').replace(/\s+/g, '_')}_mockups.zip`);
    } catch (err) {
      console.error('ZIP generation failed:', err);
      alert('ZIP download failed. Please try individual downloads instead.');
    } finally {
      setZipLoading(false);
    }
  };

  const current = mockups[selected];
  const completedCount = TEMPLATES.filter(t => mockups[t.id]?.url).length;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel" style={{ maxWidth: 720 }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] brand-gradient flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Mockup Studio</h2>
            <p className="text-sm text-purple-200 mt-0.5">{logo?.brand_name} · {completedCount}/{TEMPLATES.length} generated</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              disabled={completedCount === 0 || zipLoading}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-white/20 text-white hover:bg-white/30 transition disabled:opacity-40 flex items-center gap-1.5"
            >
              {zipLoading
                ? <><span className="w-3 h-3 border-2 border-white/60 border-t-white rounded-full animate-spin" />Zipping...</>
                : '📦 Download All ZIP'
              }
            </button>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors text-lg">×</button>
          </div>
        </div>

        <div className="p-5 flex gap-5" style={{ minHeight: 340 }}>
          {/* Template Sidebar */}
          <div className="w-44 flex-shrink-0 space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Templates</p>
            {TEMPLATES.map(t => {
              const m = mockups[t.id];
              let badge = null;
              if (m.loading)      badge = <span className="text-[10px] text-yellow-400">⏳</span>;
              else if (m.url)     badge = <span className="text-[10px] text-green-400">✓</span>;
              else if (m.error)   badge = <span className="text-[10px] text-red-400">✗</span>;

              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selected === t.id
                      ? 'brand-gradient text-white shadow-lg'
                      : 'hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{t.icon}</span>
                    {badge}
                  </div>
                  <p className="text-sm font-semibold mt-1">{t.label}</p>
                  <p className={`text-xs mt-0.5 ${selected === t.id ? 'text-purple-200' : 'text-[var(--text-muted)]'}`}>{t.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-64 rounded-2xl glass-card relative overflow-hidden">
            {current.loading && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[var(--text-muted)]">Compositing mockup...</p>
              </div>
            )}
            {current.error && !current.loading && (
              <div className="text-center p-6">
                <p className="text-3xl mb-3">🚧</p>
                <p className="text-[var(--text-secondary)] text-sm mb-1 font-semibold">Coming Soon!</p>
                <p className="text-xs text-[var(--text-muted)]">{current.error}</p>
                <button
                  onClick={() => generateOne(selected)}
                  className="mt-3 px-4 py-1.5 rounded-xl text-xs font-semibold brand-gradient text-white hover:opacity-90 transition"
                >
                  Retry
                </button>
              </div>
            )}
            {current.url && !current.loading && (
              <div className="w-full p-4">
                <img src={current.url} alt="Mockup preview" className="w-full rounded-xl shadow-lg" />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {current.url && (
          <div className="p-4 border-t border-[var(--border-color)] flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={handleDownloadOne}
              className="px-5 py-2 rounded-xl brand-gradient text-white font-semibold text-sm hover:opacity-90 transition"
            >
              ⬇ Download {TEMPLATES.find(t => t.id === selected)?.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockupModal;
