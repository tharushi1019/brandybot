import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import JSZip from "jszip";
import Chatbot from "../components/Chatbot";

export default function MockUpGenerator({ mockupData }) {
  /**
   * mockupData expected to be passed from LogoGenerator or global state:
   * {
   *   logoUrl: string,
   *   brandName: string,
   *   mockups: [
   *     { type: "T-Shirt", imageUrl: "/mockup_tshirt.png" },
   *     { type: "Business Card", imageUrl: "/mockup_card.png" },
   *   ]
   * }
   */

  // Default mockups (AUTO-LOADED for PoC Demo)
  const defaultMockups = [
    { type: "T-Shirt", imageUrl: "/src/assets/mockups/tshirt_mockup.png" },
    { type: "Business Card", imageUrl: "/src/assets/mockups/businesscard_mockup.png" },
    { type: "Instagram Post", imageUrl: "/src/assets/mockups/instagram_mockup.png" },
    { type: "Merchandise / Mug", imageUrl: "/src/assets/mockups/mug_mockup.png" },
  ];

  // If mockupData exists → use that, else use default
  const [mockups, setMockups] = useState(
    mockupData?.mockups?.length ? mockupData.mockups : defaultMockups
  );

  useEffect(() => {
    if (mockupData?.mockups) {
      setMockups(mockupData.mockups);
    }
  }, [mockupData]);

  /** -------------------------------
   *  DOWNLOAD ALL MOCKUPS (ZIP)
   --------------------------------*/
  const handleDownloadAll = async () => {
    const zip = new JSZip();

    for (const mockup of mockups) {
      const response = await fetch(mockup.imageUrl);
      const blob = await response.blob();
      const fileName = `${mockup.type.replace(/\s+/g, "_").toLowerCase()}.png`;

      zip.file(fileName, blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = "brandybot_mockups.zip";
    link.click();
  };

  /** -------------------------------
   *  SHARE MOCKUPS (WEB SHARE API)
   --------------------------------*/
  const handleShareMockups = async () => {
    try {
      const files = [];

      for (const mockup of mockups) {
        const response = await fetch(mockup.imageUrl);
        const blob = await response.blob();

        files.push(
          new File([blob], `${mockup.type.replace(/\s+/g, "_")}.png`, { type: blob.type })
        );
      }

      if (navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({
          title: "BrandyBot Mockups",
          text: "Here are your generated brand mockups!",
          files,
        });
      } else {
        alert("Sharing images is not supported on this device/browser.");
      }
    } catch (err) {
      console.error("Sharing failed:", err);
      alert("Unable to share mockups.");
    }
  };

  /** -------------------------------
   *  DOWNLOAD SINGLE MOCKUP
   --------------------------------*/
  const handleDownloadSingle = async (mockup) => {
    const response = await fetch(mockup.imageUrl);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${mockup.type.replace(/\s+/g, "_").toLowerCase()}.png`;
    link.click();
  };

  /** -------------------------------
   *  SHARE SINGLE MOCKUP
   --------------------------------*/
  const handleShareSingle = async (mockup) => {
    try {
      const response = await fetch(mockup.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${mockup.type.replace(/\s+/g, "_")}.png`, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `BrandyBot - ${mockup.type}`,
          text: `Check out my ${mockup.type} mockup!`,
          files: [file],
        });
      } else {
        alert("Sharing this mockup is not supported on this device/browser.");
      }
    } catch (err) {
      console.error("Sharing failed:", err);
      alert("Unable to share this mockup.");
    }
  };

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
            <h1 className="text-2xl font-bold text-white">Mockup Generator</h1>
            <p className="text-purple-100 text-sm">BrandyBot Design System</p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Preview Your Brand</h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
            See how your logo and brand identity look on real-world products and marketing materials. Choose your favorite mockups to download or share.
          </p>
        </div>
      </div>

      {/* Mockup Cards */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-8 pb-12">
          {mockups.length > 0 ? (
            mockups.map((mockup, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                      {index + 1}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{mockup.type}</h2>
                  </div>
                </div>

                {/* Card Content */}
                <div className="px-8 py-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                    <img
                      src={mockup.imageUrl}
                      alt={mockup.type}
                      className="max-h-64 object-contain rounded-xl shadow-md"
                    />
                    <p className="text-gray-500 font-medium mt-4">{mockup.type} Mockup</p>
                    <div className="flex gap-4">
                      {/* Download Single Mockup Button */}
                      <button
                        onClick={() => handleDownloadSingle(mockup)}
                        className="mt-4 px-5 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium transition-all duration-300 hover:text-white hover:border-transparent hover:bg-gradient-to-r hover:bg-blue-500 hover:shadow-md"
                      >
                        Download
                      </button>
                      {/* Share Single Mockup Button */}
                      <button
                        onClick={() => handleShareSingle(mockup)}
                        className="mt-4 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium hover:shadow-md hover:text-blue-600"
                      >
                        ➦Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-24">
              No mockups generated yet. Create a logo first to see live previews here.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-gray-600">© 2024 BrandyBot. All rights reserved.</p>
          <div className="flex gap-4">
            <button
              onClick={handleDownloadAll}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all shadow-md font-medium"
            >
              Download All Mockups
            </button>
            <button 
              onClick={handleShareMockups}
              className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium hover:shadow-md hover:text-blue-600"
            >
              Share Mockups
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
