import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot";
import { useLogo } from "../context/LogoContext";
import jsPDF from "jspdf";
import { createBrand } from "../services/guidelineService";

export default function BrandGuidelines() {
  const { logoData } = useLogo();
  const [sections, setSections] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const brandName = (logoData?.brandName || "Brand").trim() || "Brand";
  const logoUrl = logoData?.logoUrl || "/brandybot_icon.png";
  const primaryColors = logoData?.primaryColors || ["#FFD54F"];
  const secondaryColors = logoData?.secondaryColors || ["#4FC3F7"];
  const accentColors = logoData?.accentColors || ["#FF8A65", "#81C784", "#BA68C8"];
  const fontName = logoData?.font || "Poppins Rounded";

  const safeContent = (content) => {
    if (!content) return [];
    if (Array.isArray(content)) return content;
    return content.split(/\. |\.\n/).filter(Boolean);
  };

  const generateGuidelinesFromLogoData = (data) => {
    const name = data?.brandName || brandName;

    const colorLabels = [
      { role: "Primary", hex: data?.primaryColors?.[0] || primaryColors[0] },
      { role: "Secondary", hex: data?.secondaryColors?.[0] || secondaryColors[0] },
      ...(data?.accentColors?.length
        ? data.accentColors.map((hex, i) => ({ role: `Accent ${i + 1}`, hex }))
        : accentColors.map((hex, i) => ({ role: `Accent ${i + 1}`, hex }))),
    ];

    return [
      {
        title: "Logo Usage",
        content: [
          `${name} logo should always remain clear, friendly, and well-proportioned`,
          `Maintain the logo's original geometry; avoid stretching, rotating, or recoloring`,
          `Use at least 1× the logo height as clear space around the mark`,
          `Minimum sizes: 32px (web) / 12mm (print)`,
        ],
        image: "/logo_usage_happypaws.png",
      },
      {
        title: "Color Palette",
        content: [
          "Brand colors derived from the logo",
          "Use primary color for large brand surfaces, secondary for highlights and CTAs",
          "Use accent colors sparingly for emphasis and playful touches",
        ],
        colors: colorLabels,
      },
      {
        title: "Typography",
        content: [
          `${fontName} (heading) paired with Inter (body) provides a friendly and legible system`,
          "Headings: weights 600-700",
          "Body: 400 with 1.6 line-height",
          "Slightly increased tracking (+1%) on headings improves friendliness and readability",
        ],
        fontPreview: fontName,
      },
      {
        title: "Imagery Style",
        content: [
          "Imagery should be bright, minimal, and playful",
          "Soft vector illustrations, rounded shapes, and joyful pet elements",
          "Avoid high-contrast, dark, or photorealistic imagery that contradicts the friendly brand tone",
        ],
        image: "/imagery_style_happypaws.png",
      },
      {
        title: "Brand Voice",
        content: [
          `${name}'s voice is friendly, encouraging and simple`,
          "Use short sentences, positive language, and speak like a caring friend",
          'Example: "We’re here to make tails wag and hearts smile."',
        ],
      },
      {
        title: "Iconography",
        content: [
          "Use simple, rounded icons that mirror the logo's stroke weight and shapes",
          "Icons should be treated as supporting elements, sized consistently and aligned with the grid system",
          "Use filled or outline icons consistently across a product",
        ],
      },
      {
        title: "Spacing & Grid",
        content: [
          "Adopt a consistent spacing system based on the logo's proportions (base unit = 8px)",
          "Use multiples of the base unit for margins, paddings, and component gaps",
          "Maintain a 12-column responsive grid for layout",
        ],
      },
      {
        title: "Logo Variations",
        content: [
          "Provide full-color, mono, and reversed logo variations",
          "Use full-color logo on white/light backgrounds",
          "Use reversed or mono lockup on dark backgrounds",
          "Use icon-only mark for small sizes",
        ],
        image: "/logo_variations_happypaws.png",
      },
      {
        title: "Do's & Don'ts",
        content: [
          "DO maintain clear space and color integrity",
          "DO use primary colors prominently",
          "DON'T stretch, recolor, add heavy effects, or use the logo on busy backgrounds",
        ],
      },
      {
        title: "Accessibility Notes",
        content: [
          "Ensure contrast ratios for text and UI elements meet WCAG AA",
          "Use accessible color combinations for buttons and CTAs",
          "Provide alt text for imagery and logos",
        ],
      },
    ];
  };

  useEffect(() => {
    setSections(generateGuidelinesFromLogoData(logoData || {}));
  }, [logoData]);

  const handleDownloadPDF = async () => {
    const doc = new jsPDF("p", "pt", "a4");
    doc.setFontSize(20);
    doc.text(`${brandName} Brand Guidelines`, 40, 40);

    let y = 80;
    for (let s of sections) {
      doc.setFontSize(16);
      doc.text(s.title, 40, y);
      y += 24;

      safeContent(s.content).forEach((line) => {
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(line, 500);
        doc.text(splitText, 50, y);
        y += splitText.length * 14;
      });

      if (s.colors) {
        s.colors.forEach((c, i) => {
          doc.setFillColor(c.hex);
          doc.rect(50 + i * 30, y, 20, 20, "F");
          doc.setFontSize(10);
          doc.text(c.hex, 50 + i * 30, y + 35);
        });
        y += 50;
      }

      if (s.image) {
        try {
          const img = new Image();
          img.src = s.image;
          await new Promise((resolve) => {
            img.onload = () => {
              const imgWidth = 400;
              const imgHeight = (img.height / img.width) * imgWidth;
              if (y + imgHeight > 800) {
                doc.addPage();
                y = 40;
              }
              doc.addImage(img, "PNG", 50, y, imgWidth, imgHeight);
              y += imgHeight + 20;
              resolve(true);
            };
          });
        } catch (err) {
          console.error("PDF image error:", err);
        }
      }

      y += 20;
      if (y > 750) {
        doc.addPage();
        y = 40;
      }
    }

    doc.save(`${brandName}_Brand_Guidelines.pdf`);
  };

  const handleSaveBrand = async () => {
    if (!brandName) return;

    setIsSaving(true);
    try {
      await createBrand({
        brandName: brandName,
        tagline: "Generated via BrandyBot",
        description: `Brand guidelines for ${brandName}`,
        logo: {
          primaryLogoUrl: logoUrl,
          variants: []
        },
        guidelines: {
          colors: {
            primary: primaryColors[0],
            secondary: secondaryColors[0],
            accent: accentColors
          },
          typography: {
            primaryFont: fontName,
            secondaryFont: "Inter"
          },
          sections: sections // Save the generated text content
        }
      });
      alert('Brand saved successfully!');
      // navigate('/dashboard'); // Optional: redirect to dashboard
    } catch (error) {
      console.error('Failed to save brand:', error);
      alert('Failed to save brand. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareGuidelines = () => {
    if (navigator.share) {
      navigator.share({
        title: `${brandName} Brand Guidelines`,
        text: `Check out the ${brandName} brand guidelines.`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("Share not supported on this browser.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <header className="p-6 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img src="/brandybot_icon.png" className="h-10 w-10 rounded-full shadow-md" alt="BrandyBot Logo" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Brand Guidelines</h1>
            <p className="text-purple-100 text-sm">BrandyBot Design System</p>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center gap-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">{brandName}</h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
              Auto-generated brand guidelines preview - tailored from the selected logo.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <img
                src={logoUrl}
                alt={`${brandName} logo`}
                className="h-28 w-28 rounded-md shadow-md object-contain bg-white p-2"
              />
              <div>
                <div className="text-sm text-gray-500">Brand Colors</div>
                <div className="flex gap-2 mt-2">
                  {[...primaryColors, ...secondaryColors, ...accentColors].map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div style={{ background: c }} className="w-10 h-10 rounded-md border border-gray-200" />
                      <div className="text-xs text-gray-600">{c}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-gray-500">Primary Font</div>
                <div className="mt-1 font-semibold">{fontName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-8 pb-12">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-6 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                  {idx + 1}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <div className="px-8 py-6">
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-lg mb-6">
                  {safeContent(section.content).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                {section.fontPreview && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-500 mb-2">Font Preview</div>
                    <div className="p-4 rounded-md bg-white border border-gray-100 shadow-sm">
                      <p style={{ fontFamily: section.fontPreview }} className="text-2xl font-bold">
                        The quick brown fox jumps over the lazy dog
                      </p>
                      <p className="text-sm text-gray-500 mt-2">{section.fontPreview}</p>
                    </div>
                  </div>
                )}

                {section.colors && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-500 mb-2">Colors</div>
                    <div className="flex gap-2 flex-wrap">
                      {section.colors.map((c, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div style={{ background: c.hex }} className="w-10 h-10 rounded-md border border-gray-200" />
                          <div className="text-xs text-gray-600">{c.hex}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.image && (
                  <div className="mt-6">
                    <img
                      src={section.image}
                      alt={`${section.title} example`}
                      className="w-full max-h-80 rounded-xl shadow-md object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
          <p className="text-gray-600">© 2024 BrandyBot. All rights reserved.</p>
          <div className="flex gap-4">
            <button
              onClick={handleSaveBrand}
              disabled={isSaving}
              className={`px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all shadow-md font-medium ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? 'Saving...' : 'Save to Dashboard'}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all shadow-md font-medium"
            >
              Download PDF
            </button>
            <button
              onClick={handleShareGuidelines}
              className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium hover:shadow-md hover:text-blue-600"
            >
              Share Guidelines
            </button>
          </div>
        </div>
      </footer>
      {/* Chatbot Floating Button */}
      <div className="fixed bottom-6 right-6">
        <Chatbot />
      </div>
    </div>
  );
}
