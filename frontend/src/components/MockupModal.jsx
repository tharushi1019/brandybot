import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const TEMPLATES = [
  { id: 'business_card', label: 'Business Card', icon: '💼', desc: '3.5" × 2" standard card', width: 700, height: 400 },
  { id: 'tshirt',        label: 'T-Shirt',       icon: '👕', desc: 'Chest logo placement', width: 520, height: 600 },
  { id: 'mug',           label: 'Mug',            icon: '☕', desc: '11oz classic mug', width: 540, height: 420 },
  { id: 'website_hero',  label: 'Website Hero',   icon: '🖥️', desc: '1200px website header', width: 700, height: 380 },
  { id: 'social_banner', label: 'Social Banner',  icon: '📱', desc: '1080×1080 social media', width: 520, height: 520 },
];

// ─── Canvas Renderers ─────────────────────────────────────────────

const drawBusinessCard = (ctx, logoImg, brandName, W, H) => {
  // Dark gradient background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0f0c29");
  bg.addColorStop(0.5, "#302b63");
  bg.addColorStop(1, "#24243e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // White card area
  const cardX = 24, cardY = 24, cardW = W - 48, cardH = H - 48, radius = 16;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  } else {
    ctx.rect(cardX, cardY, cardW, cardH);
  }
  ctx.fill();

  // Purple accent stripe (right side)
  const stripeX = cardX + cardW - 80;
  ctx.fillStyle = "rgba(124,58,237,0.95)";
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(stripeX, cardY, 80, cardH, [0, radius, radius, 0]);
  } else {
    ctx.fillRect(stripeX, cardY, 80, cardH);
  }
  ctx.fill();

  // Logo on left half
  const logoSize = Math.min(cardH - 80, 160);
  const logoX = cardX + 50;
  const logoY = cardY + (cardH - logoSize) / 2;

  // White circle behind logo
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#f8f8ff";
  ctx.beginPath();
  ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

  // Brand name + tagline (center area)
  const textX = logoX + logoSize + 36;
  ctx.fillStyle = "#1a1a2e";
  ctx.font = "bold 26px Inter, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(brandName || "Your Brand", textX, cardY + cardH / 2 - 18);

  ctx.fillStyle = "#6b7280";
  ctx.font = "13px Inter, Arial, sans-serif";
  ctx.fillText("Creative Director", textX, cardY + cardH / 2 + 10);

  ctx.fillStyle = "#9ca3af";
  ctx.font = "12px Inter, Arial, sans-serif";
  ctx.fillText("hello@yourbrand.com", textX, cardY + cardH / 2 + 32);
  ctx.fillText("+1 (555) 000-0000", textX, cardY + cardH / 2 + 52);

  // White stripe decorative pattern
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(stripeX + 20, cardY + 30 + i * 60, 40, 3);
  }
};

const drawTShirt = (ctx, logoImg, brandName, W, H) => {
  ctx.fillStyle = "#2d2d2d";
  ctx.fillRect(0, 0, W, H);

  // T-shirt silhouette
  ctx.fillStyle = "#3d3d3d";
  ctx.beginPath();
  ctx.moveTo(110, 80);
  ctx.lineTo(0, 148);
  ctx.lineTo(60, 168);
  ctx.lineTo(62, 542);
  ctx.lineTo(458, 542);
  ctx.lineTo(460, 168);
  ctx.lineTo(520, 148);
  ctx.lineTo(410, 80);
  ctx.quadraticCurveTo(360, 58, 260, 62);
  ctx.quadraticCurveTo(160, 58, 110, 80);
  ctx.closePath();
  ctx.fill();

  // Subtle fabric texture lines
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // White circle behind logo
  const cx = W / 2, cy = 290;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.arc(cx, cy, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Logo
  const logoSize = 160;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 14;
  ctx.drawImage(logoImg, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
  ctx.restore();

  // Brand name under logo
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "bold 18px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(brandName || "Your Brand", cx, cy + logoSize / 2 + 32);
};

const drawMug = (ctx, logoImg, brandName, W, H) => {
  ctx.fillStyle = "#f5f0eb";
  ctx.fillRect(0, 0, W, H);

  // Mug body shadow
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(90, 50, 320, 300, 20);
  else ctx.rect(90, 50, 320, 300);
  ctx.fill();
  ctx.restore();

  // Mug body border
  ctx.strokeStyle = "#e5ddd6";
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(90, 50, 320, 300, 20);
  else ctx.rect(90, 50, 320, 300);
  ctx.stroke();

  // Handle
  ctx.strokeStyle = "#d1c7be";
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(412, 200, 52, -Math.PI / 2.2, Math.PI / 2.2);
  ctx.stroke();

  // Purple accent top band
  ctx.fillStyle = "#7C3AED";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(90, 50, 320, 32, [20, 20, 0, 0]);
  else ctx.fillRect(90, 50, 320, 32);
  ctx.fill();

  // Logo
  const logoSize = 140;
  const logoX = 90 + (320 - logoSize) / 2;
  const logoY = 50 + 32 + (300 - 32 - logoSize) / 2;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.1)";
  ctx.shadowBlur = 8;
  ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
  ctx.restore();

  // Brand name
  ctx.fillStyle = "#374151";
  ctx.font = "bold 17px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(brandName || "Your Brand", W / 2 - 30, H - 48);

  // Coffee bean decorations
  ctx.fillStyle = "#a97c50";
  const beans = [[470, 280], [490, 310], [455, 320]];
  beans.forEach(([bx, by]) => {
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
};

const drawInstagram = (ctx, logoImg, brandName, W, H) => {
  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#667eea");
  grad.addColorStop(0.5, "#764ba2");
  grad.addColorStop(1, "#f093fb");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative circles
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(W - 60, 60, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(60, H - 60, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Grid dots pattern
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#ffffff";
  for (let x = 20; x < W; x += 30) {
    for (let y = 20; y < H; y += 30) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // White glass card for logo
  const cardSize = 200, cardX = (W - cardSize) / 2, cardY = 90;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 30;
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardSize, cardSize, 24);
  else ctx.rect(cardX, cardY, cardSize, cardSize);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Logo
  const logoSize = 150;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 10;
  ctx.drawImage(logoImg, cardX + (cardSize - logoSize) / 2, cardY + (cardSize - logoSize) / 2, logoSize, logoSize);
  ctx.restore();

  // Brand name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 10;
  ctx.fillText(brandName || "Your Brand", W / 2, cardY + cardSize + 50);

  // Tagline
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "14px Inter, Arial, sans-serif";
  ctx.shadowBlur = 0;
  ctx.fillText("Built with ✨ BrandyBot AI", W / 2, cardY + cardSize + 78);
};

const drawWebsiteHero = (ctx, logoImg, brandName, W, H) => {
  // Beautiful gradient background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0f172a");
  bg.addColorStop(1, "#1e293b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Grid dots pattern
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#38bdf8";
  for (let x = 20; x < W; x += 30) {
    for (let y = 20; y < H; y += 30) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Browser frame area
  const bX = 40, bY = 30, bW = W - 80, bH = H - 60, radius = 12;
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bX, bY, bW, bH, radius);
  else ctx.rect(bX, bY, bW, bH);
  ctx.fill();
  ctx.restore();

  // Browser top bar
  ctx.fillStyle = "#f1f5f9";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bX, bY, bW, 36, [radius, radius, 0, 0]);
  else ctx.fillRect(bX, bY, bW, 36);
  ctx.fill();

  // Browser control dots (red, yellow, green)
  const dotColors = ["#ef4444", "#eab308", "#22c55e"];
  dotColors.forEach((color, idx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(bX + 20 + idx * 16, bY + 18, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Browser URL bar
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bX + 80, bY + 8, bW - 160, 20, 6);
  else ctx.fillRect(bX + 80, bY + 8, bW - 160, 20);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#94a3b8";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`https://www.${(brandName || "yourbrand").toLowerCase().replace(/\s+/g, "")}.com`, bX + bW / 2, bY + 22);

  // Navbar
  const navY = bY + 36;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(bX, navY, bW, 40);
  ctx.strokeStyle = "#f1f5f9";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bX, navY + 40);
  ctx.lineTo(bX + bW, navY + 40);
  ctx.stroke();

  // Logo in Navbar
  const navLogoSize = 24;
  ctx.drawImage(logoImg, bX + 20, navY + 8, navLogoSize, navLogoSize);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 12px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(brandName || "Brand", bX + 20 + navLogoSize + 8, navY + 24);

  // Nav links
  ctx.fillStyle = "#64748b";
  ctx.font = "500 11px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Products   Services   About   Contact", bX + bW - 20, navY + 24);

  // Hero section content
  const heroY = navY + 40;
  const heroH = bH - 76;

  // Background gradient for hero area
  const heroBg = ctx.createLinearGradient(bX, heroY, bX + bW, heroY + heroH);
  heroBg.addColorStop(0, "#f8fafc");
  heroBg.addColorStop(1, "#f1f5f9");
  ctx.fillStyle = heroBg;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bX, heroY, bW, heroH, [0, 0, radius, radius]);
  else ctx.fillRect(bX, heroY, bW, heroH);
  ctx.fill();

  // Large brand logo centered
  const largeLogoSize = Math.min(heroH - 60, 110);
  const logoL = bX + 40;
  const logoT = heroY + (heroH - largeLogoSize) / 2;
  ctx.drawImage(logoImg, logoL, logoT, largeLogoSize, largeLogoSize);

  // Hero text right side
  const heroTextX = logoL + largeLogoSize + 30;
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 24px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Welcome to the Future", heroTextX, heroY + heroH / 2 - 20);

  ctx.fillStyle = "#475569";
  ctx.font = "12px sans-serif";
  ctx.fillText(`Experience innovation tailored for ${brandName || "your business"}.`, heroTextX, heroY + heroH / 2 + 5);

  // Button
  ctx.fillStyle = "#7C3AED";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(heroTextX, heroY + heroH / 2 + 20, 100, 28, 6);
  else ctx.fillRect(heroTextX, heroY + heroH / 2 + 20, 100, 28);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Get Started", heroTextX + 50, heroY + heroH / 2 + 37);
};

// ─── Master canvas renderer ────────────────────────────────────
const RENDERERS = {
  business_card: drawBusinessCard,
  tshirt: drawTShirt,
  mug: drawMug,
  website_hero: drawWebsiteHero,
  social_banner: drawInstagram,
};

const generateMockupCanvas = (logoImg, template, brandName, renderer) => {
  const canvas = document.createElement("canvas");
  canvas.width = template.width;
  canvas.height = template.height;
  const ctx = canvas.getContext("2d");
  if (renderer) {
    renderer(ctx, logoImg, brandName, template.width, template.height);
  }
  return canvas.toDataURL("image/png");
};

// ─── Main Component ────────────────────────────────────────────────

const MockupModal = ({ logo, onClose }) => {
  const navigate = useNavigate();
  // Map of template id → { url, loading, error }
  const [mockups, setMockups] = useState(() =>
    Object.fromEntries(TEMPLATES.map(t => [t.id, { url: null, loading: true, error: null }]))
  );
  const [selected, setSelected] = useState('business_card');
  const [zipLoading, setZipLoading] = useState(false);
  const [transparentLogoUrl, setTransparentLogoUrl] = useState(null);
  const [isRemovingBg, setIsRemovingBg] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [bgError, setBgError] = useState(null);

  // Step 1: Remove background on mount
  useEffect(() => {
    if (!logo?.logo_url) return;

    const fetchTransparentLogo = async () => {
      setIsRemovingBg(true);
      try {
        const res = await api.post("/utils/remove-bg", {
          imageUrl: logo.logo_url,
        });
        if (res.data?.data?.transparentUrl) {
          setTransparentLogoUrl(res.data.data.transparentUrl);
        } else {
          setTransparentLogoUrl(logo.logo_url);
        }
      } catch (err) {
        console.error("Failed to remove background in modal:", err);
        setBgError("Could not remove background. Using original logo.");
        setTransparentLogoUrl(logo.logo_url);
      } finally {
        setIsRemovingBg(false);
      }
    };
    fetchTransparentLogo();
  }, [logo?.logo_url]);

  // Step 2: Pre-generate all templates when transparentLogoUrl is ready
  useEffect(() => {
    if (!transparentLogoUrl || isRemovingBg) return;

    setIsGenerating(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const generated = {};
      TEMPLATES.forEach(t => {
        try {
          const renderer = RENDERERS[t.id];
          const dataUrl = generateMockupCanvas(img, t, logo?.brand_name, renderer);
          generated[t.id] = { url: dataUrl, loading: false, error: null };
        } catch (err) {
          console.error(`Failed to render canvas template ${t.id}:`, err);
          generated[t.id] = { url: null, loading: false, error: "Render failed" };
        }
      });
      setMockups(generated);
      setIsGenerating(false);
    };
    img.onerror = () => {
      console.error("Failed to load logo image in modal canvas");
      const errorState = {};
      TEMPLATES.forEach(t => {
        errorState[t.id] = { url: null, loading: false, error: "Image load failed" };
      });
      setMockups(errorState);
      setIsGenerating(false);
    };
    img.src = transparentLogoUrl;
  }, [transparentLogoUrl, isRemovingBg, logo?.brand_name]);

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

  const current = mockups[selected] || { url: null, loading: true, error: null };
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
              onClick={() => {
                navigate('/mockup_generator', { state: { logoUrl: logo?.logo_url, brandName: logo?.brand_name } });
                onClose();
              }}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition flex items-center gap-1.5 shadow-lg"
            >
              🧊 Open in 3D Studio
            </button>
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
              const m = mockups[t.id] || { url: null, loading: true, error: null };
              let badge = null;
              if (isRemovingBg || isGenerating || m.loading) badge = <span className="text-[10px] text-yellow-400">⏳</span>;
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

          {/* Preview Panel */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-64 rounded-2xl glass-card relative overflow-hidden bg-gray-50 border border-gray-100 p-4">
            {isRemovingBg && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[var(--text-muted)] font-medium">Removing logo background...</p>
              </div>
            )}
            {isGenerating && !isRemovingBg && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[var(--text-muted)] font-medium">Compositing mockup...</p>
              </div>
            )}
            {!isRemovingBg && !isGenerating && current.error && (
              <div className="text-center p-6">
                <p className="text-3xl mb-3">🚧</p>
                <p className="text-[var(--text-secondary)] text-sm mb-1 font-semibold">Render Error</p>
                <p className="text-xs text-[var(--text-muted)]">{current.error}</p>
              </div>
            )}
            {!isRemovingBg && !isGenerating && current.url && (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={current.url}
                  alt="Mockup preview"
                  className="max-w-full max-h-72 object-contain rounded-xl shadow-lg border border-gray-100"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {!isRemovingBg && !isGenerating && current.url && (
          <div className="p-4 border-t border-[var(--border-color)] flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={() => window.open(current.url, '_blank')}
              className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition"
            >
              🔗 Open in New Tab
            </button>
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
