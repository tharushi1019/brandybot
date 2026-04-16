import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ── Section Header ────────────────────────────────────────────── */
const Section = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">{title}</h3>
    {children}
  </div>
);

/* ── Color Swatch ──────────────────────────────────────────────── */
const ColorSwatch = ({ hex, name, usage }) => (
  <div className="flex items-center gap-2.5 mb-2">
    <div className="w-9 h-9 rounded-xl flex-shrink-0 shadow-md border border-white/10"
         style={{ backgroundColor: hex || '#7C3AED' }} />
    <div className="min-w-0">
      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
        {name}&nbsp;<span className="font-mono text-xs opacity-50">{hex}</span>
      </p>
      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{usage}</p>
    </div>
  </div>
);

/* ── Programmatic PDF builder ──────────────────────────────────── */
async function buildPDF(guidelines, logo, brandContext, isDark) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });

  const W = pdf.internal.pageSize.getWidth();   // 595
  const H = pdf.internal.pageSize.getHeight();  // 842
  const PAD = 44;
  const COL = (W - PAD * 2 - 20) / 2;           // column width

  /* ── Theme colours ── */
  const THEME = isDark ? {
    pageBg:    [10, 10, 30],
    accentBar: [124, 58, 237],
    cardBg:    [20, 20, 50],
    titleCol:  [255, 255, 255],
    bodyCol:   [200, 200, 230],
    mutedCol:  [140, 140, 170],
    secLabel:  [124, 58, 237],
    dosBg:     [22, 80, 42],
    dontsBg:   [80, 22, 22],
    dosText:   [100, 220, 130],
    dontsText: [220, 100, 100],
    voiceBg:   [124, 58, 237],
  } : {
    pageBg:    [250, 250, 255],
    accentBar: [124, 58, 237],
    cardBg:    [240, 238, 255],
    titleCol:  [26, 10, 60],
    bodyCol:   [60, 50, 90],
    mutedCol:  [120, 110, 150],
    secLabel:  [109, 40, 217],
    dosBg:     [220, 250, 228],
    dontsBg:   [255, 230, 230],
    dosText:   [30, 120, 60],
    dontsText: [160, 30, 30],
    voiceBg:   [124, 58, 237],
  };

  /* ── Page background ── */
  pdf.setFillColor(...THEME.pageBg);
  pdf.rect(0, 0, W, H, 'F');

  /* ── Top accent bar ── */
  pdf.setFillColor(...THEME.accentBar);
  pdf.rect(0, 0, W, 5, 'F');

  /* ── Header row: logo image + brand name ── */
  let logoImgData = null;
  if (logo?.logo_url) {
    try {
      const r = await fetch(logo.logo_url);
      const blob = await r.blob();
      logoImgData = await new Promise(res => {
        const rd = new FileReader();
        rd.onload = () => res(rd.result);
        rd.readAsDataURL(blob);
      });
    } catch (_) { /* cors blocked, skip */ }
  }

  const LOGO_SIZE = 56;
  const ROW_Y = 24;
  if (logoImgData) {
    pdf.addImage(logoImgData, 'PNG', PAD, ROW_Y, LOGO_SIZE, LOGO_SIZE, undefined, 'FAST');
  } else {
    // Fallback: colored square
    pdf.setFillColor(...THEME.accentBar);
    pdf.roundedRect(PAD, ROW_Y, LOGO_SIZE, LOGO_SIZE, 8, 8, 'F');
  }

  const brandName = brandContext?.brandName || logo?.brand_name || 'Brand';
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(...THEME.titleCol);
  pdf.text(brandName, PAD + LOGO_SIZE + 14, ROW_Y + 22);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(...THEME.mutedCol);
  pdf.text('Brand Guidelines', PAD + LOGO_SIZE + 14, ROW_Y + 38);

  /* ── Divider ── */
  let yLeft = ROW_Y + LOGO_SIZE + 18;
  let yRight = yLeft;
  pdf.setDrawColor(...THEME.accentBar);
  pdf.setLineWidth(0.5);
  pdf.line(PAD, yLeft - 4, W - PAD, yLeft - 4);

  /* ─── LEFT COLUMN ────────────────────────────────────────────── */
  const LX = PAD;
  const RX = PAD + COL + 16;

  /* Color Palette */
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...THEME.secLabel);
  pdf.text('COLOR PALETTE', LX, yLeft);
  yLeft += 12;

  if (guidelines.colorPalette) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...THEME.mutedCol);
    
    Object.values(guidelines.colorPalette).forEach(c => {
      const hex = c.hex || '#7C3AED';
      const r = parseInt(hex.slice(1, 3), 16) || 0;
      const g = parseInt(hex.slice(3, 5), 16) || 0;
      const b = parseInt(hex.slice(5, 7), 16) || 0;
      pdf.setFillColor(r, g, b);
      pdf.roundedRect(LX, yLeft, 24, 24, 6, 6, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...THEME.bodyCol);
      pdf.text(c.name || '', LX + 30, yLeft + 9);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(...THEME.mutedCol);
      const usageLine = pdf.splitTextToSize(`${hex}  |  ${c.usage || ''}`, COL - 35);
      pdf.text(usageLine, LX + 30, yLeft + 20);
      yLeft += 34;
    });
  }
  yLeft += 8;

  /* Typography */
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...THEME.secLabel);
  pdf.text('TYPOGRAPHY', LX, yLeft);
  yLeft += 10;

  const typoBg = isDark ? [20, 20, 50] : [240, 238, 255];
  pdf.setFillColor(...typoBg);
  pdf.roundedRect(LX, yLeft, COL, 52, 5, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...THEME.bodyCol);
  pdf.text(`Primary: ${guidelines.typography?.primaryFont || 'Inter'}`, LX + 10, yLeft + 14);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...THEME.mutedCol);
  pdf.text(`Secondary: ${guidelines.typography?.secondaryFont || 'Helvetica'}`, LX + 10, yLeft + 27);
  if (guidelines.typography?.rationale) {
    const ratLines = pdf.splitTextToSize(guidelines.typography.rationale, COL - 20);
    pdf.setFontSize(7.5);
    pdf.text(ratLines.slice(0, 2), LX + 10, yLeft + 38);
  }
  yLeft += 60;

  /* Logo Usage */
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...THEME.secLabel);
  pdf.text('LOGO USAGE', LX, yLeft);
  yLeft += 10;
  (guidelines.logoUsage || []).forEach(rule => {
    pdf.setFillColor(...THEME.accentBar);
    pdf.circle(LX + 3, yLeft - 2, 2, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...THEME.bodyCol);
    const lines = pdf.splitTextToSize(rule, COL - 12);
    pdf.text(lines, LX + 10, yLeft);
    yLeft += lines.length * 11 + 3;
  });

  /* ─── RIGHT COLUMN ───────────────────────────────────────────── */
  /* Brand Voice */
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...THEME.secLabel);
  pdf.text('BRAND VOICE', RX, yRight);
  yRight += 11;

  /* Pills */
  let pillX = RX;
  (guidelines.brandVoice?.tone || []).forEach(t => {
    const pillW = pdf.getTextWidth(t) + 16;
    if (pillX + pillW > RX + COL) { pillX = RX; yRight += 18; }
    pdf.setFillColor(...THEME.voiceBg);
    pdf.roundedRect(pillX, yRight - 9, pillW, 14, 7, 7, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text(t, pillX + 8, yRight);
    pillX += pillW + 5;
  });
  yRight += 16;

  if (guidelines.brandVoice?.examplePhrase) {
    const phrBg = isDark ? [28, 28, 58] : [235, 230, 255];
    pdf.setFillColor(...phrBg);
    const phrLines = pdf.splitTextToSize(`"${guidelines.brandVoice.examplePhrase}"`, COL - 16);
    const phrH = phrLines.length * 11 + 12;
    pdf.roundedRect(RX, yRight, COL, phrH, 5, 5, 'F');
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...THEME.bodyCol);
    pdf.text(phrLines, RX + 8, yRight + 12);
    yRight += phrH + 8;
  }
  yRight += 4;

  /* Do's */
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...THEME.secLabel);
  pdf.text("DO'S & DON'TS", RX, yRight);
  yRight += 10;

  const HALF = (COL - 6) / 2;

  /* DO box */
  pdf.setFillColor(...THEME.dosBg);
  pdf.roundedRect(RX, yRight, HALF, 110, 5, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...THEME.dosText);
  pdf.text('DO', RX + 8, yRight + 13);

  let dosY = yRight + 24;
  (guidelines.dosAndDonts?.dos || []).forEach(d => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...THEME.dosText);
    const lines = pdf.splitTextToSize(`• ${d}`, HALF - 16);
    pdf.text(lines, RX + 8, dosY);
    dosY += lines.length * 11 + 4;
  });

  /* DON'T box */
  pdf.setFillColor(...THEME.dontsBg);
  pdf.roundedRect(RX + HALF + 6, yRight, HALF, 110, 5, 5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...THEME.dontsText);
  pdf.text("DON'T", RX + HALF + 14, yRight + 13);

  let dontsY = yRight + 24;
  (guidelines.dosAndDonts?.donts || []).forEach(d => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...THEME.dontsText);
    const lines = pdf.splitTextToSize(`• ${d}`, HALF - 16);
    pdf.text(lines, RX + HALF + 14, dontsY);
    dontsY += lines.length * 11 + 4;
  });

  /* ── Footer ── */
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(...THEME.mutedCol);
  pdf.text(`Generated by BrandyBot  •  ${new Date().toLocaleDateString()}`, W / 2, H - 18, { align: 'center' });

  pdf.save(`${brandName.replace(/\s+/g, '_')}_Brand_Guidelines.pdf`);
}

/* ── Main Component ────────────────────────────────────────────── */
const BrandGuidelinesModal = ({ logo, brandContext = {}, onClose }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [guidelines, setGuidelines] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => { fetchGuidelines(); }, []);

  const getToken = async () => user?.getIdToken ? await user.getIdToken() : null;

  const fetchGuidelines = async () => {
    setLoading(true); setError(null);
    try {
      const token = await getToken();
      if (logo?.id) {
        try {
          const cached = await axios.get(`${API}/brands/guidelines/${logo.id}`, { headers: { Authorization: `Bearer ${token}` } });
          if (cached.data?.data?.guidelines) { setGuidelines(cached.data.data.guidelines); return; }
        } catch (_) { /* fall through */ }
      }
      const res = await axios.post(`${API}/brands/guidelines/generate`, {
        brandName: brandContext.brandName || logo?.brand_name || 'My Brand',
        industry: brandContext.industry || '',
        targetAudience: brandContext.targetAudience || '',
        personality: brandContext.personality || '',
        colors: brandContext.colors || '',
        logoId: logo?.id || null,
        aiPrompt: logo?.prompt || '',
      }, { headers: { Authorization: `Bearer ${token}` } });
      setGuidelines(res.data.data.guidelines);
    } catch (e) { setError('Failed to generate guidelines. Please try again.'); }
    finally { setLoading(false); }
  };

  const downloadPDF = async () => {
    if (!guidelines) return;
    setPdfLoading(true);
    try {
      await buildPDF(guidelines, logo, brandContext, isDark);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Please try again.');
    } finally { setPdfLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] brand-gradient flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Brand Guidelines</h2>
            <p className="text-sm text-purple-200 mt-0.5">{brandContext.brandName || logo?.brand_name}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadPDF} disabled={!guidelines || pdfLoading}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-white/20 text-white hover:bg-white/30 transition disabled:opacity-40 flex items-center gap-2">
              {pdfLoading
                ? <><span className="w-3 h-3 border-2 border-white/60 border-t-white rounded-full animate-spin" />Generating...</>
                : `⬇ Download ${isDark ? 'Dark' : 'Light'} PDF`}
            </button>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition text-lg">×</button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mb-4" />
              <p style={{ color: 'var(--text-secondary)' }}>Generating your brand guidelines...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={fetchGuidelines} className="px-6 py-2 rounded-xl brand-gradient text-white text-sm font-semibold">Try Again</button>
            </div>
          )}
          {guidelines && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left column */}
              <div>
                {logo?.logo_url && (
                  <div className="mb-5 p-4 rounded-2xl glass-card flex justify-center">
                    <img src={logo.logo_url} alt="Logo" className="h-20 object-contain" crossOrigin="anonymous" />
                  </div>
                )}
                <Section title="Color Palette">
                  {guidelines.colorPalette && Object.values(guidelines.colorPalette).map((c, i) => (
                    <ColorSwatch key={i} hex={c.hex} name={c.name} usage={c.usage} />
                  ))}
                </Section>
                <Section title="Typography">
                  <div className="p-4 rounded-xl glass-card">
                    <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                      Primary: {guidelines.typography?.primaryFont}
                    </p>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Secondary: {guidelines.typography?.secondaryFont}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {guidelines.typography?.rationale}
                    </p>
                  </div>
                </Section>
              </div>

              {/* Right column */}
              <div>
                <Section title="Logo Usage">
                  <ul className="space-y-2">
                    {guidelines.logoUsage?.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span className="text-purple-400 mt-0.5 flex-shrink-0">✓</span>{r}
                      </li>
                    ))}
                  </ul>
                </Section>
                <Section title="Brand Voice">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {guidelines.brandVoice?.tone?.map((t, i) => (
                      <span key={i} className="px-3 py-1 rounded-full brand-gradient text-white text-xs font-semibold">{t}</span>
                    ))}
                  </div>
                  {guidelines.brandVoice?.examplePhrase && (
                    <div className="p-3 rounded-xl glass-card italic text-sm" style={{ color: 'var(--text-secondary)' }}>
                      "{guidelines.brandVoice.examplePhrase}"
                    </div>
                  )}
                </Section>
                <Section title="Do's & Don'ts">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <p className="text-xs font-bold text-green-400 mb-2">DO</p>
                      {guidelines.dosAndDonts?.dos?.map((d, i) => (
                        <p key={i} className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>+ {d}</p>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <p className="text-xs font-bold text-red-400 mb-2">DON'T</p>
                      {guidelines.dosAndDonts?.donts?.map((d, i) => (
                        <p key={i} className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>- {d}</p>
                      ))}
                    </div>
                  </div>
                </Section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandGuidelinesModal;
