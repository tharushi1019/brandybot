import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import JSZip from "jszip";

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
  const { logoUrl: passedLogoUrl, brandName: passedBrandName } = location.state || {};

  const [mockups, setMockups] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const logoImgRef = useRef(null);

  const [transparentLogoUrl, setTransparentLogoUrl] = useState(null);
  const [isRemovingBg, setIsRemovingBg] = useState(!!passedLogoUrl);
  const [bgError, setBgError] = useState(null);

  useEffect(() => {
    // If we have a logo URL, try to remove background first
    if (passedLogoUrl) {
      const fetchTransparentLogo = async () => {
        setIsRemovingBg(true);
        try {
          // Use our new backend endpoint which returns a clean ImgBB URL
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="p-5 flex items-center justify-between shadow-lg" style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}>
        <div className="flex items-center gap-3">
          <Link to="/"><img src="/brandybot_icon.png" className="h-10 w-10 rounded-full shadow-md ring-2 ring-white/30" alt="BrandyBot" /></Link>
          <div>
            <h1 className="text-xl font-bold text-white">Mockup Generator</h1>
            <p className="text-purple-200 text-xs">Preview your brand on real products</p>
          </div>
        </div>
        {passedLogoUrl && (
          <img src={passedLogoUrl} alt="Your logo" className="h-10 w-10 rounded-lg bg-white p-1 object-contain shadow" />
        )}
      </header>


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

      {/* Loading states */}
      {passedLogoUrl && (
        <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 pb-28">
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

          <div className="mt-8 text-center pb-20">
            <button
              onClick={handleDownloadAll}
              className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition flex items-center justify-center gap-2 mx-auto"
            >
              📦 Download All Mockups (.ZIP)
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      {
        mockups.length > 0 && (
          <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-2xl">
            <div className="max-w-5xl mx-auto px-6 py-4 flex gap-3 justify-end">
              <button onClick={generateMockups} className="px-5 py-2 text-gray-600 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
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
