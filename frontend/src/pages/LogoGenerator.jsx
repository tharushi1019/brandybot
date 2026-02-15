import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

import { generateLogo } from "../services/logoService";

export default function LogoGenerator() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm BrandyBot 👋 Let's design your perfect logo. Tell me your brand name to get started!",
    },
  ]);
  const [input, setInput] = useState("");
  const [brandInfo, setBrandInfo] = useState({ name: "", style: "", industry: "" });
  const [logos, setLogos] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    // Clear input immediately
    const currentInput = input;
    setInput("");

    // Step 1: Collect brand info
    if (!brandInfo.name) {
      setBrandInfo((prev) => ({ ...prev, name: currentInput }));
      botReply("Great! Now tell me your preferred style (e.g., modern, playful, classic).");
    } else if (!brandInfo.style) {
      setBrandInfo((prev) => ({ ...prev, style: currentInput }));
      botReply("Nice! Finally, what industry is your brand in?");
    } else if (!brandInfo.industry) {
      const updatedBrandInfo = { ...brandInfo, industry: currentInput };
      setBrandInfo(updatedBrandInfo);

      botReply("Perfect! Generating some logo options for you...");
      setIsLoading(true);

      try {
        // Call Backend API
        const result = await generateLogo({
          brandName: updatedBrandInfo.name,
          prompt: `A ${updatedBrandInfo.style} logo for ${updatedBrandInfo.name} in ${currentInput} industry`,
          style: updatedBrandInfo.style,
          industry: currentInput
        });

        if (result.success && result.data) {
          setLogos([result.data.logoUrl]); // Backend currently returns single logo
          botReply("Here is a logo option based on your inputs!");
        }
      } catch (error) {
        console.error("Generation Error:", error);
        botReply("Sorry, I encountered an error generating your logo. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const botReply = (text) => {
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text }]);
    }, 500);
  };


  // Auto scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, logos, selectedLogo]);

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
            <h1 className="text-2xl font-bold text-white">Logo Generator</h1>
            <p className="text-purple-100 text-sm">BrandyBot Design System</p>
          </div>
        </div>
      </header>

      {/* Chat Section */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] p-4 rounded-3xl text-sm shadow-md border border-gray-100 ${msg.sender === "user"
                ? "bg-gradient-to-br from-purple-600 to-purple-500 text-white shadow-lg"
                : "bg-white text-gray-800"
                }`}
            >
              {msg.sender === "bot" && (
                <div className="flex items-center mb-2">
                  <img
                    src="/brandybot_icon.png"
                    className="h-7 w-7 mr-2 rounded-full ring-2 ring-purple-100"
                    alt="bot"
                  />
                  <p className="font-semibold text-purple-600">BrandyBot</p>
                </div>
              )}
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 p-4 rounded-3xl text-sm shadow-md border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <span className="ml-2 text-gray-500">Generating logo...</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Display mock logos */}
        {logos.length > 0 && (
          <div className="flex gap-5 mt-4 flex-wrap">
            {logos.map((logo, i) => (
              <div
                key={i}
                onClick={() => setSelectedLogo(logo)}
                className={`border p-2 rounded-xl bg-white shadow-md cursor-pointer transition transform hover:scale-105 ${selectedLogo === logo ? "ring-4 ring-purple-500" : ""
                  }`}
              >
                <img src={logo} alt={`Logo ${i + 1}`} className="h-40 w-40 object-contain" />
              </div>
            ))}
          </div>
        )}

        {/* Selected logo actions */}
        {selectedLogo && (
          <div className="mt-6 p-4 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-4">
            <p className="font-semibold text-gray-700">
              Selected Logo Ready! What would you like to do next?
            </p>

            {/* Download Button */}
            <a
              href={selectedLogo}
              download="brandybot-logo.png"
              className="px-6 py-3 bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700 transition inline-block"
            >
              Download Logo
            </a>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-3">
              <Link
                to="/mockup_generator"
                state={{ logoUrl: selectedLogo }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
              >
                Go to Mockup Generator
              </Link>

              <Link
                to="/brand_guidelines"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
              >
                Generate Brand Guidelines
              </Link>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-5 bg-white/80 backdrop-blur-sm border-t border-gray-200 shadow-xl flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          type="text"
          placeholder="Type your message..."
          className="flex-1 p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white shadow-sm transition-all"
        />
        <button
          onClick={handleSend}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl hover:from-purple-700 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
