import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLogo } from "../context/LogoContext";
import api from "../services/api";
import JSZip from "jszip";

// Lazy load 3D component to keep initial load light
const ThreeDViewer = lazy(() => import("../components/ThreeDViewer"));

// Template definitions — logo will be overlaid on these colored backgrounds
const TEMPLATES = [
  {
    type: "Business Card",
    emoji: "💼",
    bgColor: "#1a1a2e",
    textColor: "#ffffff",
    width: 600,
    height: 340,
    logoX: 60,
    logoY: 90,
    logoSize: 160,
    description: "Professional business card mockup",
  },
  {
    type: "T-Shirt",
    emoji: "👕",
    bgColor: "#2d2d2d",
    textColor: "#ffffff",
    width: 500,
    height: 580,
    logoX: 150,
    logoY: 180,
    logoSize: 200,
    description: "Branded merchandise T-shirt",
  },
  {
    type: "Instagram Post",
    emoji: "📸",
    bgColor: "linear",
    gradientStart: "#667eea",
    gradientEnd: "#764ba2",
    width: 500,
    height: 500,
    logoX: 150,
    logoY: 150,
    logoSize: 200,
    description: "Social media post",
  },
  {
    type: "Coffee Mug",
    emoji: "☕",
    bgColor: "#f5f0eb",
    textColor: "#333333",
    width: 500,
    height: 380,
    logoX: 160,
    logoY: 100,
    logoSize: 180,
    description: "Branded merchandise mug",
  },
];

/**
 * Draw a single mockup on a canvas and return a data URL.
 * @param {HTMLImageElement} logoImg
 * @param {Object} template
 * @param {string} brandName
 * @returns {string} data URL
 */
const generateMockupCanvas = (logoImg, template, brandName) => {
  const canvas = document.createElement("canvas");
  canvas.width = template.width;
  canvas.height = template.height;
  const ctx = canvas.getContext("2d");

  // Background
  if (template.bgColor === "linear") {
    const grad = ctx.createLinearGradient(0, 0, template.width, template.height);
    grad.addColorStop(0, template.gradientStart);
    grad.addColorStop(1, template.gradientEnd);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = template.bgColor;
  }
  ctx.fillRect(0, 0, template.width, template.height);

  // Subtle grid / texture overlay
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < template.width; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, template.height);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // White card area for business card
  if (template.type === "Business Card") {
    ctx.fillStyle = "#ffffff";
    ctx.roundRect?.(30, 30, template.width - 60, template.height - 60, 12);
    ctx.fill();
    // Right stripe
    ctx.fillStyle = "#7C3AED";
    ctx.fillRect(template.width - 90, 30, 60, template.height - 60);
  }

  // T-shirt silhouette (simple)
  if (template.type === "T-Shirt") {
    ctx.fillStyle = "#4a4a4a";
    ctx.beginPath();
    ctx.moveTo(100, 80);
    ctx.lineTo(0, 140);
    ctx.lineTo(60, 160);
    ctx.lineTo(60, 520);
    ctx.lineTo(440, 520);
    ctx.lineTo(440, 160);
    ctx.lineTo(500, 140);
    ctx.lineTo(400, 80);
    ctx.quadraticCurveTo(350, 60, 250, 65);
    ctx.quadraticCurveTo(150, 60, 100, 80);
    ctx.closePath();
    ctx.fill();
  }

  // Mug body
  if (template.type === "Coffee Mug") {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e0d5cc";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect?.(80, 50, 320, 280, 20);
    ctx.fill();
    ctx.stroke();
    // Handle
    ctx.beginPath();
    ctx.arc(400, 190, 60, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }

  // Draw logo
  const logoSize = template.logoSize;
  const logoX = template.logoX;
  const logoY = template.logoY;

  // White circle behind logo for visibility
  if (template.type !== "Business Card") {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    const circleR = logoSize / 2 + 20;
    ctx.beginPath();
    ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, circleR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Logo image
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.1)";
  ctx.shadowBlur = 10;
  ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
  ctx.restore();

  // Brand name text
  const textColor = template.textColor || "#ffffff";
  ctx.fillStyle = textColor;
  ctx.font = `bold ${template.type === "Business Card" ? 22 : 18}px Inter, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(
    brandName || "Your Brand",
    template.type === "Business Card" ? template.width / 2 - 30 : template.width / 2,
    template.logoY + template.logoSize + 40
  );

  // Description text for Business Card
  if (template.type === "Business Card") {
    ctx.font = "13px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("hello@yourbrand.com", template.width / 2 - 30, template.logoY + template.logoSize + 70);
  }

  return canvas.toDataURL("image/png");
};

export default function MockUpGenerator() {
  const location = useLocation();
  const { logoData } = useLogo();
  
  // Priority 1: Navigation state, Priority 2: Global Context
  const passedLogoUrl = location.state?.logoUrl || logoData?.logoUrl;
  const passedBrandName = location.state?.brandName || logoData?.brandName;

  const [mockups, setMockups] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const logoImgRef = useRef(null);

  // --- 3D Studio State ---
  const [viewMode, setViewMode] = useState("2D"); // "2D" or "3D"
  const [productColor, setProductColor] = useState("#ffffff");
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [activeTemplate, setActiveTemplate] = useState("Coffee Mug");
  // ------------------------

  const [transparentLogoUrl, setTransparentLogoUrl] = useState(null);
  const [isRemovingBg, setIsRemovingBg] = useState(!!passedLogoUrl);
  const [bgError, setBgError] = useState(null);

  useEffect(() => {
    // If we have a logo URL, try to remove background first
    if (passedLogoUrl) {
      setTransparentLogoUrl(null); // Reset before fetch to prevent stale logo flicker
      const fetchTransparentLogo = async () => {
        setIsRemovingBg(true);
        try {
          // Use our backend endpoint which returns a clean ImgBB URL
          const res = await api.post('/utils/remove-bg',
            { imageUrl: passedLogoUrl },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          if (res.data?.data?.transparentUrl) {
            setTransparentLogoUrl(res.data.data.transparentUrl);
          } else {
            setTransparentLogoUrl(passedLogoUrl); // fallback
          }
        } catch (err) {
          console.error("Failed to remove background:", err);
          setBgError("Could not remove background. Using original logo.");
          setTransparentLogoUrl(passedLogoUrl); // fallback on error
        } finally {
          setIsRemovingBg(false);
        }
      };
      fetchTransparentLogo();
    }
  }, [passedLogoUrl]);

  // Wait until transparent logo (or fallback) is ready before generating
  useEffect(() => {
    if (transparentLogoUrl && !isRemovingBg) {
      generateMockups();
    }
  }, [transparentLogoUrl, isRemovingBg]);

  const generateMockups = async () => {
    setIsGenerating(true);
    setMockups([]);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      logoImgRef.current = img;
      setLogoLoaded(true);
      const generated = TEMPLATES.map((template) => ({
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
    link.download = `${passedBrandName}_${mockup.type.replace(/\s+/g, "_")}.png`;
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
    link.download = `${passedBrandName}_mockups.zip`;
    link.click();
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Contextual Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 md:pl-20 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex-shrink-0">
        <div>
          <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Mockup Generator</h1>
          <p className="text-sm text-[var(--text-muted)]">Preview your brand on real products</p>
        </div>
        {passedLogoUrl && (
          <img src={passedLogoUrl} alt="Your logo" className="h-10 w-10 rounded-lg bg-white p-1 object-contain border border-[var(--border-color)] shadow-sm" />
        )}
      </div>

      {/* Mode Switcher Tab */}
      <div className="flex justify-center mt-6 px-6">
        <div className="bg-[var(--bg-secondary)] p-1 rounded-2xl border border-[var(--border-color)] flex gap-1 shadow-sm">
          <button 
            onClick={() => setViewMode("2D")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === "2D" ? "bg-white text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
          >
            🖼️ 2D Grid
          </button>
          <button 
            onClick={() => setViewMode("3D")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === "3D" ? "bg-white text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
          >
            🧊 3D Studio
          </button>
        </div>
      </div>


      {/* No logo passed */}
      {!passedLogoUrl && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl p-12 shadow-lg text-center border border-gray-100 max-w-md">
            <span className="text-5xl mb-4 block">🎨</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No Logo Yet</h2>
            <p className="text-gray-500 mb-6">Create a logo first, then come back here to see how it looks on real products.</p>
            <Link to="/logo_generator" className="px-6 py-3 text-white rounded-xl font-semibold text-sm inline-block hover:opacity-90 transition" style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}>
              Go to Logo Generator
            </Link>
          </div>
        </div>
      )}

      {/* Content Area */}
      {passedLogoUrl && (
        <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 pb-28">
          
          {viewMode === "2D" ? (
            /* 2D Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockups.map((mockup, i) => (
                <div key={i} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition group">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <span className="text-2xl">{mockup.emoji}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{mockup.type}</h3>
                      <p className="text-xs text-gray-500">{mockup.description}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50 flex items-center justify-center">
                      <img src={mockup.imageUrl} alt={mockup.type} className="w-full object-contain" style={{ maxHeight: "280px" }} />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleDownloadSingle(mockup)}
                        className="flex-1 py-2.5 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
                        style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}
                      >
                        ⬇ Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 3D Studio View */
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* 3D Viewer Area */}
                <div className="flex-1">
                  <Suspense fallback={<div className="h-[500px] w-full flex items-center justify-center bg-gray-50 rounded-3xl border border-dashed border-gray-300">Loading 3D Engine...</div>}>
                    <ThreeDViewer 
                      templateType={activeTemplate} 
                      logoUrl={transparentLogoUrl} 
                      brandName={passedBrandName} 
                      productColor={productColor}
                      rotationSpeed={rotationSpeed}
                    />
                  </Suspense>
                </div>

                {/* 3D Controls Sidebar */}
                <div className="w-full md:w-72 flex flex-col gap-4">
                  <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                    <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                       🔧 Studio Controls
                    </h3>
                    
                    {/* Template Selector */}
                    <div className="mb-6">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Choose Product</label>
                      <div className="flex flex-col gap-2">
                        {TEMPLATES.filter(t => t.type !== "Instagram Post").map((t) => (
                          <button 
                            key={t.type}
                            onClick={() => setActiveTemplate(t.type)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-bold ${activeTemplate === t.type ? "border-[#7C3AED] bg-purple-50 text-[#7C3AED]" : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"}`}
                          >
                            <span>{t.emoji}</span> {t.type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Picker */}
                    <div className="mb-6">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Product Color</label>
                      <div className="flex flex-wrap gap-2">
                        {["#ffffff", "#1a1a1a", "#7C3AED", "#3B82F6", "#EF4444", "#10B981", "#F59E0B"].map((c) => (
                          <button 
                            key={c}
                            onClick={() => setProductColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${productColor === c ? "border-gray-900 scale-110" : "border-transparent shadow-sm"}`}
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Rotation Speed */}
                    <div className="mb-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block flex justify-between">
                        <span>Rotation Speed</span>
                        <span className="text-[#3B82F6]">{rotationSpeed}x</span>
                      </label>
                      <input 
                        type="range" 
                        min="0" 
                        max="5" 
                        step="0.5" 
                        value={rotationSpeed} 
                        onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-bold">
                         <span>Pause</span>
                         <span>Fast</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 text-white shadow-xl">
                    <p className="text-xs text-gray-400 mb-2">Live 3D rendering uses your GPU for high-fidelity previews. Interaction is fully touch & mouse enabled.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center pb-20">
            {viewMode === "2D" && (
              <button
                onClick={handleDownloadAll}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition flex items-center justify-center gap-2 mx-auto"
              >
                📦 Download All Mockups (.ZIP)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      {
        mockups.length > 0 && (
          <footer className="sticky bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] mt-auto z-10 w-full">
            <div className="max-w-5xl mx-auto px-6 py-4 flex gap-3 justify-end">
              <button onClick={generateMockups} className="px-5 py-2 text-[var(--text-primary)] border border-[var(--border-color)] bg-[var(--bg-card)] rounded-xl text-sm font-medium hover:bg-[var(--bg-card-hover)] transition">
                🔄 Regenerate
              </button>
              <button onClick={handleDownloadAll} className="px-5 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition" style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}>
                ⬇ Download All (ZIP)
              </button>
            </div>
          </footer>
        )
      }
    </div >
  );
}
