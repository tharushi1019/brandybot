import { useState } from "react";
import { Link } from "react-router-dom";

export default function BrandGuidelines() {
  const [sections] = useState([
    {
      title: "Logo Usage",
      content:
        "Use the BrandyBot logo consistently. Maintain clear space around it and avoid distortion or color changes.",
      image: "/logo_example.png",
    },
    {
      title: "Color Palette",
      content:
        "Primary colors: Purple (#6B46C1), Blue (#3182CE), Gradient usage is recommended. Secondary colors can be used for accents.",
      image: "/color_palette.png",
    },
    {
      title: "Typography",
      content:
        "Headings: 'Poppins', bold, 24px+. Body text: 'Inter', regular, 16px. Maintain hierarchy and readability.",
      image: null,
    },
    {
      title: "Imagery Style",
      content:
        "Use clean, minimal illustrations or abstract shapes with gradients. Avoid heavy textures or cluttered backgrounds.",
      image: "/imagery_example.png",
    },
    {
      title: "Brand Voice",
      content:
        "Friendly, encouraging, and professional. Use clear and concise language. Emphasize creativity and approachability.",
      image: null,
    },
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Top Header */}
      <header className="p-6 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full flex items-center justify-center">
            <Link to="/">
              <img
                src="/brandybot_icon.png"
                className="h-10 w-10 rounded-full shadow-md"
                alt="BrandyBot Logo"
              />
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Brand Guidelines</h1>
            <p className="text-purple-100 text-sm">BrandyBot Design System</p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Design System Overview</h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
            Maintain brand consistency across all touchpoints. These guidelines ensure our visual identity remains cohesive and recognizable.
          </p>
        </div>
      </div>

      {/* Guidelines Sections */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-8 pb-12">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Section Header */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                    {index + 1}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>
              </div>

              {/* Section Content */}
              <div className="px-8 py-6">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {section.content}
                </p>

                {/* Image Placeholder */}
                {section.image && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-dashed border-gray-300">
                    <div className="flex flex-col items-center justify-center space-y-3 py-12">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">{section.title} Example</p>
                      <p className="text-gray-400 text-sm">{section.image}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">© 2024 BrandyBot. All rights reserved.</p>
            <div className="flex gap-4">
              <button className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                Download PDF
              </button>
              <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all shadow-md font-medium">
                Share Guidelines
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}