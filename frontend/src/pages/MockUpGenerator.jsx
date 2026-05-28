import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLogo } from "../context/LogoContext";
import api from "../services/api";
import JSZip from "jszip";

// Lazy load 3D component to keep initial load light
const ThreeDViewer = lazy(() => import("../components/ThreeDViewer"));

// ─── 2D Template Definitions ──────────────────────────────────────
// Each template has a canvas renderer function + display metadata
const TEMPLATES = [
  {
    id: "business_card",
    type: "Business Card",
    emoji: "💼",
    bgColor: "#1a1a2e",
    description: "Professional business card",
    width: 700,
    height: 400,
  },
  {
    id: "tshirt",
    type: "T-Shirt",
    emoji: "👕",
    bgColor: "#2d2d2d",
    description: "Branded merchandise T-shirt",
    width: 520,
    height: 600,
  },
  {
    id: "instagram",
    type: "Instagram Post",
    emoji: "📸",
    bgColor: "gradient",
    description: "Social media post",
    width: 520,
    height: 520,
  },
  {
    id: "mug",
    type: "Coffee Mug",
    emoji: "☕",
    bgColor: "#f5f0eb",
    description: "Branded merchandise mug",
    width: 540,
    height: 420,
  },
  {
    id: "billboard",
    type: "Billboard",
    emoji: "🏙️",
    bgColor: "#0f172a",
    description: "Outdoor advertising billboard",
    width: 700,
    height: 380,
  },
  {
    id: "notebook",
    type: "Notebook",
    emoji: "📓",
    bgColor: "#1e293b",
    description: "Branded notebook cover",
    width: 420,
    height: 560,
  },
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

const drawBillboard = (ctx, logoImg, brandName, W, H) => {
  // Night sky background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0f172a");
  bg.addColorStop(1, "#1e293b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Stars
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  for (let i = 0; i < 60; i++) {
    const sx = Math.random() * W;
    const sy = Math.random() * H * 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Billboard frame (poles)
  ctx.fillStyle = "#374151";
  ctx.fillRect(W / 2 - 18, H * 0.5, 36, H * 0.5);

  // Billboard board
  const bX = 40, bY = 28, bW = W - 80, bH = H * 0.55;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 10;

  const boardGrad = ctx.createLinearGradient(bX, bY, bX + bW, bY + bH);
  boardGrad.addColorStop(0, "#1e1b4b");
  boardGrad.addColorStop(1, "#312e81");
  ctx.fillStyle = boardGrad;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bX, bY, bW, bH, 12);
  else ctx.rect(bX, bY, bW, bH);
  ctx.fill();
  ctx.restore();

  // Border glow
  ctx.strokeStyle = "#7C3AED";
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bX, bY, bW, bH, 12);
  else ctx.rect(bX, bY, bW, bH);
  ctx.stroke();

  // Logo left side of board
  const logoSize = Math.min(bH - 48, 160);
  const logoX = bX + 40;
  const logoY = bY + (bH - logoSize) / 2;

  ctx.save();
  ctx.shadowColor = "rgba(124,58,237,0.4)";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.beginPath();
  ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

  // Text right side
  const textX = logoX + logoSize + 40;
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.min(30, bW * 0.05)}px Inter, Arial, sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText(brandName || "Your Brand", textX, bY + bH / 2 - 20);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "13px Inter, Arial, sans-serif";
  ctx.fillText("Where great brands begin.", textX, bY + bH / 2 + 8);

  // Neon underline
  ctx.strokeStyle = "#7C3AED";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#7C3AED";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(textX, bY + bH / 2 + 18);
  ctx.lineTo(textX + 140, bY + bH / 2 + 18);
  ctx.stroke();
  ctx.shadowBlur = 0;
};

const drawNotebook = (ctx, logoImg, brandName, W, H) => {
  // Cover background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1e293b");
  bg.addColorStop(1, "#0f172a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Pages (right side offset shadow effect)
  ctx.fillStyle = "#e8e8e0";
  for (let i = 4; i >= 0; i--) {
    ctx.fillStyle = `rgba(240,240,230,${0.4 + i * 0.1})`;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(22 + i * 2, 22 + i * 2, W - 44, H - 44, 8);
    else ctx.rect(22 + i * 2, 22 + i * 2, W - 44, H - 44);
    ctx.fill();
  }

  // Cover
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = -4;
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(20, 20, W - 44, H - 40, 8);
  else ctx.rect(20, 20, W - 44, H - 40);
  ctx.fill();
  ctx.restore();

  // Subtle texture on cover
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = "#ffffff";
  for (let y = 20; y < H - 20; y += 14) {
    ctx.fillRect(20, y, W - 44, 1);
  }
  ctx.globalAlpha = 1;

  // Purple top accent bar
  ctx.fillStyle = "#7C3AED";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(20, 20, W - 44, 7, [8, 8, 0, 0]);
  else ctx.fillRect(20, 20, W - 44, 7);
  ctx.fill();

  // Logo center
  const logoSize = Math.min(W - 120, H * 0.35, 180);
  const logoX = 20 + (W - 44 - logoSize) / 2;
  const logoY = 20 + 40;

  ctx.save();
  ctx.shadowColor = "rgba(124,58,237,0.3)";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath();
  ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
  ctx.restore();

  // Brand name
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.min(22, W * 0.05)}px Inter, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(brandName || "Your Brand", W / 2 - 12, logoY + logoSize + 42);

  // Tagline
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "11px Inter, Arial, sans-serif";
  ctx.fillText("brandybot.ai", W / 2 - 12, logoY + logoSize + 64);

  // Elastic strap line
  ctx.strokeStyle = "#7C3AED";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#7C3AED";
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(20, H / 2);
  ctx.lineTo(W - 24, H / 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Spiral dots on left spine
  ctx.fillStyle = "#4B5563";
  for (let y = 60; y < H - 60; y += 32) {
    ctx.beginPath();
    ctx.arc(34, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
};

// ─── Master canvas renderer ────────────────────────────────────
const RENDERERS = {
  business_card: drawBusinessCard,
  tshirt: drawTShirt,
  instagram: drawInstagram,
  mug: drawMug,
  billboard: drawBillboard,
  notebook: drawNotebook,
};

const generateMockupCanvas = (logoImg, template, brandName) => {
  const canvas = document.createElement("canvas");
  canvas.width = template.width;
  canvas.height = template.height;
  const ctx = canvas.getContext("2d");
  const renderer = RENDERERS[template.id];
  if (renderer) {
    renderer(ctx, logoImg, brandName, template.width, template.height);
  }
  return canvas.toDataURL("image/png");
};

// ─── 3D product list (must match ThreeDViewer/MockupModels) ───────
const THREE_D_PRODUCTS = [
  { type: "Coffee Mug", emoji: "☕" },
  { type: "Business Card", emoji: "💼" },
  { type: "T-Shirt", emoji: "👕" },
  { type: "Hoodie", emoji: "🧥" },
  { type: "Notebook", emoji: "📓" },
  { type: "Water Bottle", emoji: "💧" },
];

// ─── Main Component ────────────────────────────────────────────────
export default function MockUpGenerator() {
  const location = useLocation();
  const { logoData } = useLogo();

  const passedLogoUrl = location.state?.logoUrl || logoData?.logoUrl;
  const passedBrandName = location.state?.brandName || logoData?.brandName;

  const [mockups, setMockups] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const logoImgRef = useRef(null);

  // 3D Studio state
  const [viewMode, setViewMode] = useState("2D");
  const [productColor, setProductColor] = useState("#ffffff");
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [activeTemplate, setActiveTemplate] = useState("Coffee Mug");
  const [logoX, setLogoX] = useState(0);
  const [logoY, setLogoY] = useState(0);
  const [logoScale, setLogoScale] = useState(1);

  // Background removal
  const [transparentLogoUrl, setTransparentLogoUrl] = useState(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgError, setBgError] = useState(null);

  useEffect(() => {
    if (!passedLogoUrl) return;
    setTransparentLogoUrl(null);
    setBgError(null);
    const fetchTransparentLogo = async () => {
      setIsRemovingBg(true);
      try {
        // Use the shared api instance (auto-attaches Firebase token)
        const res = await api.post("/utils/remove-bg", {
          imageUrl: passedLogoUrl,
        });
        if (res.data?.data?.transparentUrl) {
          setTransparentLogoUrl(res.data.data.transparentUrl);
        } else {
          setTransparentLogoUrl(passedLogoUrl);
        }
      } catch (err) {
        console.error("Failed to remove background:", err);
        setBgError("Could not remove background. Using original logo.");
        setTransparentLogoUrl(passedLogoUrl);
      } finally {
        setIsRemovingBg(false);
      }
    };
    fetchTransparentLogo();
  }, [passedLogoUrl]);

  useEffect(() => {
    if (transparentLogoUrl && !isRemovingBg) {
      generateAllMockups();
    }
  }, [transparentLogoUrl, isRemovingBg]);

  const generateAllMockups = () => {
    setIsGenerating(true);
    setMockups([]);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      logoImgRef.current = img;
      const generated = TEMPLATES.map((template) => ({
        id: template.id,
        type: template.type,
        emoji: template.emoji,
        description: template.description,
        imageUrl: generateMockupCanvas(img, template, passedBrandName),
      }));
      setMockups(generated);
      setIsGenerating(false);
    };
    img.onerror = () => {
      console.error("Failed to load logo image for mockup canvas");
      setIsGenerating(false);
    };
    img.src = transparentLogoUrl;
  };

  const handleDownloadSingle = (mockup) => {
    const link = document.createElement("a");
    link.href = mockup.imageUrl;
    link.download = `${passedBrandName || "brand"}_${mockup.type.replace(/\s+/g, "_")}.png`;
    link.click();
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    mockups.forEach((mockup) => {
      const base64 = mockup.imageUrl.replace(/^data:image\/png;base64,/, "");
      zip.file(`${mockup.type.replace(/\s+/g, "_")}.png`, base64, { base64: true });
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${passedBrandName || "brand"}_mockups.zip`;
    link.click();
  };

  // ─── Status panels ────────────────────────────────────────────
  const LoadingPanel = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-60 gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#7C3AED] animate-spin" />
      </div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 md:pl-20 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex-shrink-0">
        <div>
          <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
            Mockup Studio
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Preview your brand on real products — 2D &amp; 3D
          </p>
        </div>
        {passedLogoUrl && (
          <img
            src={passedLogoUrl}
            alt="Your logo"
            className="h-10 w-10 rounded-lg bg-white p-1 object-contain border border-[var(--border-color)] shadow-sm"
          />
        )}
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center mt-6 px-6">
        <div className="bg-[var(--bg-secondary)] p-1 rounded-2xl border border-[var(--border-color)] flex gap-1 shadow-sm">
          <button
            id="mode-2d"
            onClick={() => setViewMode("2D")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              viewMode === "2D"
                ? "bg-white text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            🖼️ 2D Canvas Grid
          </button>
          <button
            id="mode-3d"
            onClick={() => setViewMode("3D")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              viewMode === "3D"
                ? "bg-white text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            🧊 3D Studio
          </button>
        </div>
      </div>

      {/* No Logo State */}
      {!passedLogoUrl && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl p-12 shadow-lg text-center border border-gray-100 max-w-md">
            <span className="text-5xl mb-4 block">🎨</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No Logo Yet</h2>
            <p className="text-gray-500 mb-6">
              Create a logo first, then come back here to see how it looks on
              real products.
            </p>
            <Link
              to="/logo-agent"
              className="px-6 py-3 text-white rounded-xl font-semibold text-sm inline-block hover:opacity-90 transition"
              style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}
            >
              Go to Logo Agent
            </Link>
          </div>
        </div>
      )}

      {/* Content */}
      {passedLogoUrl && (
        <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 pb-28">

          {/* Status banners */}
          {bgError && (
            <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl">
              ⚠️ {bgError}
            </div>
          )}

          {/* ── 2D Grid ── */}
          {viewMode === "2D" && (
            <>
              {isRemovingBg && (
                <LoadingPanel message="Removing background from logo..." />
              )}
              {isGenerating && !isRemovingBg && (
                <LoadingPanel message="Rendering mockup templates..." />
              )}

              {!isGenerating && !isRemovingBg && mockups.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {mockups.map((mockup) => (
                    <div
                      key={mockup.id}
                      className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group"
                    >
                      {/* Card header */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                        <span className="text-2xl">{mockup.emoji}</span>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">
                            {mockup.type}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {mockup.description}
                          </p>
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="p-4">
                        <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center min-h-[200px]">
                          <img
                            src={mockup.imageUrl}
                            alt={mockup.type}
                            className="w-full object-contain"
                            style={{ maxHeight: "280px" }}
                          />
                        </div>
                        <button
                          id={`download-${mockup.id}`}
                          onClick={() => handleDownloadSingle(mockup)}
                          className="mt-3 w-full py-2.5 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
                          style={{
                            background:
                              "linear-gradient(90deg, #7C3AED, #3B82F6)",
                          }}
                        >
                          ⬇ Download PNG
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── 3D Studio ── */}
          {viewMode === "3D" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Viewer */}
                <div className="flex-1">
                  <Suspense
                    fallback={
                      <div className="h-[500px] w-full flex items-center justify-center bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                        <p className="text-gray-400 text-sm font-medium animate-pulse">
                          Loading 3D Engine...
                        </p>
                      </div>
                    }
                  >
                    <ThreeDViewer
                      templateType={activeTemplate}
                      logoUrl={transparentLogoUrl}
                      brandName={passedBrandName}
                      productColor={productColor}
                      rotationSpeed={rotationSpeed}
                      logoX={logoX}
                      logoY={logoY}
                      logoScale={logoScale}
                    />
                  </Suspense>
                </div>

                {/* 3D Controls sidebar */}
                <div className="w-full md:w-72 flex flex-col gap-4">
                  <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
                    <h3 className="font-black text-gray-900 mb-5 flex items-center gap-2 text-sm">
                      🔧 Studio Controls
                    </h3>

                    {/* Product Selector */}
                    <div className="mb-6">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                        Choose Product
                      </label>
                      <div className="flex flex-col gap-2">
                        {THREE_D_PRODUCTS.map((p) => (
                          <button
                            key={p.type}
                            id={`3d-product-${p.type.toLowerCase().replace(/\s+/g, "-")}`}
                            onClick={() => setActiveTemplate(p.type)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-sm font-bold ${
                              activeTemplate === p.type
                                ? "border-[#7C3AED] bg-purple-50 text-[#7C3AED]"
                                : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                            }`}
                          >
                            <span>{p.emoji}</span> {p.type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Picker */}
                    <div className="mb-6">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                        Product Color
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "#ffffff",
                          "#1a1a1a",
                          "#7C3AED",
                          "#3B82F6",
                          "#EF4444",
                          "#10B981",
                          "#F59E0B",
                          "#EC4899",
                        ].map((c) => (
                          <button
                            key={c}
                            onClick={() => setProductColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                              productColor === c
                                ? "border-gray-800 scale-110 shadow-md"
                                : "border-transparent shadow-sm"
                            }`}
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Logo Adjustments */}
                    <div className="mb-6 border-t border-gray-100 pt-6">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">
                        📐 Logo Placement
                      </label>
                      
                      {/* Position Y Slider */}
                      <div className="mb-4">
                        <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-1">
                          <span>Vertical Position</span>
                          <span className="text-[#7C3AED]">{logoY > 0 ? `+${logoY.toFixed(2)}` : logoY.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="-1"
                          max="1"
                          step="0.05"
                          value={logoY}
                          onChange={(e) => setLogoY(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                        />
                      </div>

                      {/* Position X Slider */}
                      <div className="mb-4">
                        <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-1">
                          <span>Horizontal Position</span>
                          <span className="text-[#7C3AED]">{logoX > 0 ? `+${logoX.toFixed(2)}` : logoX.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="-1"
                          max="1"
                          step="0.05"
                          value={logoX}
                          onChange={(e) => setLogoX(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                        />
                      </div>

                      {/* Scale Slider */}
                      <div className="mb-4">
                        <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-1">
                          <span>Logo Size</span>
                          <span className="text-[#7C3AED]">{logoScale.toFixed(2)}×</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.05"
                          value={logoScale}
                          onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                        />
                      </div>

                      {/* Reset Button */}
                      <button
                        onClick={() => { setLogoX(0); setLogoY(0); setLogoScale(1); }}
                        className="w-full py-1 text-[10px] font-bold text-gray-400 hover:text-gray-600 border border-dashed border-gray-200 rounded-lg transition-colors"
                      >
                        Reset Placement
                      </button>
                    </div>

                    {/* Rotation Speed */}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
                        <span>Rotation Speed</span>
                        <span className="text-[#3B82F6]">{rotationSpeed}×</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={rotationSpeed}
                        onChange={(e) =>
                          setRotationSpeed(parseFloat(e.target.value))
                        }
                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-bold">
                        <span>Pause</span>
                        <span>Fast</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-5 text-white shadow-xl">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      🎮 Drag to rotate · Scroll to zoom · Use controls above to pause, switch lighting &amp; download screenshot.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Download All */}
          {viewMode === "2D" && mockups.length > 0 && (
            <div className="mt-8 text-center pb-20">
              <button
                id="download-all-zip"
                onClick={handleDownloadAll}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition flex items-center justify-center gap-2 mx-auto"
              >
                📦 Download All Mockups (.ZIP)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sticky Footer */}
      {mockups.length > 0 && (
        <footer className="sticky bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] mt-auto z-10 w-full">
          <div className="max-w-6xl mx-auto px-6 py-4 flex gap-3 justify-end">
            <button
              onClick={generateAllMockups}
              className="px-5 py-2 text-[var(--text-primary)] border border-[var(--border-color)] bg-[var(--bg-card)] rounded-xl text-sm font-medium hover:bg-[var(--bg-card-hover)] transition"
            >
              🔄 Regenerate
            </button>
            <button
              onClick={handleDownloadAll}
              className="px-5 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
              style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}
            >
              ⬇ Download All (ZIP)
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
