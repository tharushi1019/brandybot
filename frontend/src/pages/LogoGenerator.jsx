import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { generateLogo } from "../services/logoService";

// The 7-step interview questions
const INTERVIEW_STEPS = [
  {
    key: "brandName",
    question: "Hi! I'm BrandyBot 👋 I'm here to help you design the perfect logo.\n\nLet's start with the basics — **what's your brand name?**",
  },
  {
    key: "tagline",
    question: "Great name! Do you have a **tagline or slogan**? (It's okay to skip this — just type \"none\")",
  },
  {
    key: "industry",
    question: "What **industry or niche** is your brand in?\n\n_(e.g., Tech startup, Coffee shop, Fashion, Healthcare, Fitness, Education)_",
  },
  {
    key: "targetAudience",
    question: "Who is your **target audience**?\n\n_(e.g., Young professionals aged 25–35, Parents with young children, Gamers, Corporate executives)_",
  },
  {
    key: "personality",
    question: "How would you describe your brand's **personality and vibe**?\n\n_(e.g., Bold & energetic, Elegant & luxury, Friendly & playful, Minimal & modern, Trustworthy & corporate)_",
  },
  {
    key: "colors",
    question: "Any **color preferences or moods** in mind?\n\n_(e.g., Deep blues and gold, Earthy greens, Vibrant neons, Monochrome black/white, No preference)_",
  },
  {
    key: "style",
    question: "Finally — what **logo style** do you prefer?\n\n_(e.g., Flat icon + text, Badge/crest emblem, Lettermark/monogram, Abstract geometric, Illustrative mascot)_",
  },
];

const formatMessage = (text) =>
  text.split("\n").map((line, i) => (
    <span key={i}>
      {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={j}>{part.slice(2, -2)}</strong>
        ) : (
          part
        )
      )}
      {i < text.split("\n").length - 1 && <br />}
    </span>
  ));

export default function LogoGenerator() {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([
    { sender: "bot", text: INTERVIEW_STEPS[0].question },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [brandProfile, setBrandProfile] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState(null);
  const [logoData, setLogoData] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const [imgError, setImgError] = useState(false);

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const botReply = (text, delay = 600) => {
    setTimeout(() => addMessage("bot", text), delay);
  };

  // Proper download: fetch as blob for server-stored files; window.open as fallback
  const handleDownload = async (url, name) => {
    try {
      if (url.startsWith("data:")) {
        // base64 data URL — direct anchor download
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name || "logo"}.png`;
        a.click();
      } else {
        // Server-stored file — fetch as blob first (bypasses browser open-in-tab)
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `${name || "logo"}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      }
    } catch {
      // Fallback to open in new tab
      window.open(url, "_blank");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isDone) return;

    const answer = input.trim();
    setInput("");
    addMessage("user", answer);

    const currentStep = INTERVIEW_STEPS[step];
    const updatedProfile = { ...brandProfile, [currentStep.key]: answer };
    setBrandProfile(updatedProfile);

    const nextStep = step + 1;

    if (nextStep < INTERVIEW_STEPS.length) {
      // Move to next question
      setStep(nextStep);
      botReply(INTERVIEW_STEPS[nextStep].question);
    } else {
      // All questions answered — generate logo
      setStep(nextStep);
      setIsDone(true);
      setIsLoading(true);

      const summary = `
📋 **Brand Brief Summary:**
• **Brand:** ${updatedProfile.brandName}
• **Tagline:** ${updatedProfile.tagline !== "none" ? updatedProfile.tagline : "None"}
• **Industry:** ${updatedProfile.industry}
• **Audience:** ${updatedProfile.targetAudience}
• **Vibe:** ${updatedProfile.personality}
• **Colors:** ${updatedProfile.colors}
• **Style:** ${updatedProfile.style}

Perfect! I have everything I need. Let me design your logo now — this may take 20–40 seconds... 🎨✨
      `.trim();

      botReply(summary, 400);

      try {
        const result = await generateLogo({
          brandName: updatedProfile.brandName,
          tagline: updatedProfile.tagline !== "none" ? updatedProfile.tagline : "",
          industry: updatedProfile.industry,
          targetAudience: updatedProfile.targetAudience,
          personality: updatedProfile.personality,
          colors: updatedProfile.colors,
          style: updatedProfile.style,
          prompt: `${updatedProfile.style} logo for ${updatedProfile.brandName}, ${updatedProfile.industry} brand`,
        });

        if (result.success && result.data) {
          const logoUrl = result.data.logo_url;
          setGeneratedLogo(logoUrl);
          setLogoData(result.data);
          botReply("🎉 Your logo is ready! What do you think? Click on it to select it, then choose what to do next.", 1000);
        }
      } catch (error) {
        console.error("Generation Error:", error);
        botReply(
          "😔 I ran into an issue generating your logo. The AI service might be offline. Please try again in a moment.",
          800
        );
        setIsDone(false);
        setStep(INTERVIEW_STEPS.length - 1);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRetry = () => {
    setStep(0);
    setBrandProfile({});
    setGeneratedLogo(null);
    setLogoData(null);
    setIsDone(false);
    setIsLoading(false);
    setMessages([{ sender: "bot", text: INTERVIEW_STEPS[0].question }]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, generatedLogo]);

  // Build the full logo URL — if it's a relative path, prepend the API base URL
  const resolveLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("data:") || url.startsWith("http")) return url;
    const apiBase = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
    return `${apiBase}${url}`;
  };

  const displayLogoUrl = resolveLogoUrl(generatedLogo);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "linear-gradient(135deg, #f8f7ff 0%, #ede9fe 50%, #dbeafe 100%)" }}>
      {/* Header */}
      <header
        className="p-5 flex items-center justify-between shadow-lg"
        style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}
      >
        <div className="flex items-center gap-3">
          <Link to="/">
            <img src="/brandybot_icon.png" className="h-10 w-10 rounded-full shadow-md ring-2 ring-white/30" alt="BrandyBot" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Logo Generator</h1>
            <p className="text-purple-200 text-xs">AI-Powered Brand Design Interview</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <span className="hidden sm:inline">Step</span>
          <span className="font-bold text-white">{Math.min(step + 1, INTERVIEW_STEPS.length)}</span>
          <span>/</span>
          <span>{INTERVIEW_STEPS.length}</span>
          {/* Progress bar */}
          <div className="ml-3 w-24 h-2 bg-white/20 rounded-full overflow-hidden hidden sm:block">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(Math.min(step, INTERVIEW_STEPS.length) / INTERVIEW_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pb-36">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "bot" && (
              <img src="/brandybot_icon.png" className="h-8 w-8 rounded-full ring-2 ring-purple-200 mr-2 mt-1 flex-shrink-0" alt="bot" />
            )}
            <div
              className={`max-w-[80%] sm:max-w-[65%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === "user"
                ? "text-white rounded-br-sm"
                : "bg-white text-gray-800 border border-purple-50 rounded-bl-sm shadow-md"
                }`}
              style={msg.sender === "user" ? { background: "linear-gradient(135deg, #7C3AED, #6D28D9)" } : {}}
            >
              {formatMessage(msg.text)}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <img src="/brandybot_icon.png" className="h-8 w-8 rounded-full ring-2 ring-purple-200 mr-2 mt-1 flex-shrink-0" alt="bot" />
            <div className="bg-white border border-purple-50 px-5 py-4 rounded-2xl rounded-bl-sm shadow-md">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <div key={delay} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
                <span className="text-gray-500 text-sm ml-2">Crafting your logo with AI...</span>
              </div>
            </div>
          </div>
        )}

        {/* Generated Logo */}
        {displayLogoUrl && (
          <div className="flex justify-start">
            <img src="/brandybot_icon.png" className="h-8 w-8 rounded-full ring-2 ring-purple-200 mr-2 mt-1 flex-shrink-0" alt="bot" />
            <div className="bg-white border border-purple-100 p-5 rounded-2xl rounded-bl-sm shadow-lg max-w-xs w-full">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">Your Logo</p>
              {imgError ? (
                <div className="w-48 h-48 mx-auto flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <div className="text-center">
                    <span className="text-3xl">🎨</span>
                    <p className="text-xs text-gray-400 mt-1">Logo saved on server</p>
                    <button onClick={() => window.open(displayLogoUrl, '_blank')} className="mt-2 text-xs text-purple-600 underline">Open in browser</button>
                  </div>
                </div>
              ) : (
                <img
                  src={displayLogoUrl}
                  alt={`${brandProfile.brandName} logo`}
                  className="w-48 h-48 object-contain rounded-xl border border-gray-100 shadow-sm mx-auto block"
                  onError={() => setImgError(true)}
                />
              )}
              <p className="text-center text-sm text-gray-500 mt-2 font-medium">{brandProfile.brandName}</p>

              {/* Action buttons */}
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => handleDownload(displayLogoUrl, brandProfile.brandName)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-semibold shadow-md hover:opacity-90 transition"
                  style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}
                >
                  ⬇ Download Logo
                </button>
                <Link
                  to="/mockup_generator"
                  state={{ logoUrl: displayLogoUrl, brandName: brandProfile.brandName }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-blue-700 transition"
                >
                  👕 Create Mockups
                </Link>
                <Link
                  to="/brand_guidelines"
                  state={{ brandProfile, logoUrl: generatedLogo }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-green-700 transition"
                >
                  📘 Brand Guidelines
                </Link>
                <button
                  onClick={handleRetry}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
                >
                  🔄 Generate Another
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-purple-100 shadow-2xl p-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          type="text"
          placeholder={isDone && !generatedLogo ? "Generating your logo..." : isDone ? "Logo ready! Use the buttons above." : INTERVIEW_STEPS[Math.min(step, INTERVIEW_STEPS.length - 1)]?.key === "tagline" ? "Your tagline (or type 'none')..." : "Type your answer..."}
          disabled={isLoading || (isDone && generatedLogo)}
          className="flex-1 px-4 py-3 border border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white shadow-sm text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || (isDone && !!generatedLogo) || !input.trim()}
          className="px-6 py-3 text-white rounded-2xl font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
