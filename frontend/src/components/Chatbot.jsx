import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import chatbotIcon from "../assets/chatbot.png";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const STORAGE_KEY = "brandybot-guest-history";
const HANDOFF_KEY = "brandybot-guest-handoff";

// ─── Markdown renderer ──────────────────────────────────────────
// Converts **bold**, numbered lists, and line breaks into JSX
const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    // Numbered list item  e.g.  "1. **Title:** desc"
    const listMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (listMatch) {
      const content = listMatch[2];
      return (
        <div key={i} className="mt-1.5 flex gap-2 items-start">
          <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "rgba(124,58,237,0.2)", color: "#7c3aed" }}>
            {listMatch[1]}
          </span>
          <span>{inlineBold(content)}</span>
        </div>
      );
    }
    // Blank line → spacer
    if (!trimmed) return <div key={i} className="h-1" />;
    // Regular line
    return <p key={i} className={i > 0 && lines[i - 1].trim() ? "mt-0.5" : ""}>{inlineBold(trimmed)}</p>;
  });
};

// Handles **bold** within a line, returns array of spans
const inlineBold = (text) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
};

// ─── helpers ────────────────────────────────────────────────────
const loadGuestHistory = () => {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};
const saveGuestHistory = (history) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};
const clearGuestHistory = () => {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem("brandybot-session-messages");
};

export default function Chatbot() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(null);         // display messages
  const [convHistory, setConvHistory] = useState([]);     // {role, content} for API
  const [sessionId, setSessionId] = useState(null);       // DB session for auth users
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [brandContext, setBrandContext] = useState({});
  const messagesEndRef = useRef(null);

  // ── Restore guest history from sessionStorage on mount ──────────
  useEffect(() => {
    if (!user) {
      const savedHistory = loadGuestHistory();
      if (savedHistory.length > 0) {
        // Restore display messages from history
        const displayMsgs = savedHistory.map(m => ({
          sender: m.role === "user" ? "user" : "bot",
          text: m.content,
        }));
        setMessages(displayMsgs);
        setConvHistory(savedHistory);
      }
    } else {
      // When user logs in, clear any guest remnants
      clearGuestHistory();
    }
  }, [user]);

  // ── Greeting on first open ──────────────────────────────────────
  useEffect(() => {
    if (isOpen && messages === null) {
      const name = user?.displayName?.split(" ")[0] || null;
      setMessages([{
        sender: "bot",
        text: name
          ? `Hey ${name}! 👋 I'm BrandyBot — your AI branding co-pilot. Tell me about the brand you're building!`
          : "Hello! 👋 I'm BrandyBot — your AI branding co-pilot. Ask me anything about logos, brand colors, typography, or business identity! What are you building? 🚀",
      }]);
    }
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  const addBot = (text, extra = {}) => {
    setMessages(prev => [...(prev || []), { sender: "bot", text, ...extra }]);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || isBotTyping) return;
    setMessages(prev => [...(prev || []), { sender: "user", text }]);
    setInput("");
    setIsBotTyping(true);

    // Keep last 20 turns for API context
    const historyForApi = convHistory.slice(-20);

    try {
      let data;

      if (user) {
        // ── Logged-in: authenticated endpoint with real-time DB save ──
        const token = await user.getIdToken();
        const res = await axios.post(
          `${API}/chat/message`,
          { message: text, context: "general", history: historyForApi, sessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        data = res.data?.data;
        // Track session ID for the whole conversation
        if (data?.sessionId && !sessionId) setSessionId(data.sessionId);

      } else {
        // ── Guest: public endpoint, send full history for memory ──
        const res = await axios.post(`${API}/chat/guest-message`, {
          message: text,
          history: historyForApi,
        });
        data = res.data?.data;
      }

      const botText = data?.message || "I didn't quite get that — tell me more about your brand!";
      const action  = data?.action  || null;
      const payload = data?.payload || null;

      // Update conversation history
      const newHistory = [
        ...convHistory,
        { role: "user",      content: text },
        { role: "assistant", content: botText },
      ];
      setConvHistory(newHistory);

      // Persist guest history to sessionStorage so it survives widget close/reopen
      if (!user) saveGuestHistory(newHistory);

      if (payload?.brandContext) setBrandContext(c => ({ ...c, ...payload.brandContext }));

      setMessages(prev => [...(prev || []), { sender: "bot", text: botText, action, payload }]);

    } catch (error) {
      console.error("Chat Error:", error);
      addBot("⚠️ I had trouble connecting. Please try again in a moment!");
    } finally {
      setIsBotTyping(false);
    }
  };

  // ── When guest needs logo → save handoff + redirect to login ───
  const handleGuestLoginHandoff = (reason) => {
    // Serialize full conversation so AuthContext can save it after login
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ messages: convHistory }));
    setIsOpen(false);
    navigate("/login");
  };

  // ── Logged-in: open Logo Agent with current session ─────────────
  const handleLogoAgent = () => {
    if (sessionId) {
      sessionStorage.setItem("brandybot-preload", JSON.stringify(brandContext));
      setIsOpen(false);
      navigate(`/logo-agent?session=${sessionId}`);
    } else {
      sessionStorage.setItem("brandybot-preload", JSON.stringify(brandContext));
      setIsOpen(false);
      navigate("/logo-agent");
    }
  };

  // Theme
  const bg = isDark ? "#16213e" : "#ffffff";
  const border = isDark ? "1px solid #2a2a45" : "1px solid #e9d5ff";
  const msgInput = isDark ? "#1a1a2e" : "#f8f5ff";
  const inputBorder = isDark ? "#2a2a45" : "#c4b5fd";
  const botBubble = isDark ? { background: "#1e1e30", color: "#f1f1f5" } : { background: "#f3f4f6", color: "#1a1a2e" };
  const textMuted = isDark ? "#6b6b8a" : "#6b7280";

  const quickActions = user ? [
    { label: "🎨 Create a Logo",     message: "I want to create a logo for my brand" },
    { label: "📋 Brand Guidelines",  message: "Help me with my brand guidelines" },
    { label: "👕 Mockup Preview",    message: "Show me mockup options" },
    { label: "💡 Branding Tips",     message: "Give me branding tips for a startup" },
  ] : [
    { label: "🎨 Logo Design Tips",  message: "What makes a great logo design?" },
    { label: "🎨 Choose Brand Colors", message: "How do I choose brand colors?" },
    { label: "📝 Brand Name Ideas",  message: "How do I choose a brand name?" },
    { label: "💡 What can you do?",  message: "What branding help can you offer?" },
  ];

  const renderActionButton = (msg) => {
    if (!msg.action) return null;

    if (msg.action === "generate_logo" || msg.action === "send_to_agent") {
      if (!user) return (
        <div className="mt-2 flex gap-2">
          <button onClick={() => handleGuestLoginHandoff("logo")}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition shadow"
            style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}>
            🔑 Sign In & Continue
          </button>
          <Link to="/signup" onClick={() => sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ messages: convHistory }))}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition shadow"
            style={{ background: "linear-gradient(90deg, #ec4899, #7C3AED)" }}>
            ✨ Sign Up Free
          </Link>
        </div>
      );
      return (
        <button onClick={handleLogoAgent}
          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition shadow-lg"
          style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}>
          🤖 Open Logo Agent
        </button>
      );
    }

    if (msg.action === "prompt_login") return (
      <div className="mt-2 flex gap-2">
        <button onClick={() => handleGuestLoginHandoff(msg.payload?.reason)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition shadow"
          style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}>
          🔑 Sign In & Continue
        </button>
        <Link to="/signup" onClick={() => sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ messages: convHistory }))}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition shadow"
          style={{ background: "linear-gradient(90deg, #ec4899, #7C3AED)" }}>
          ✨ Sign Up Free
        </Link>
      </div>
    );

    if (msg.action === "open_guidelines") return (
      <Link to="/brand_guidelines"
        className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition shadow"
        style={{ background: "linear-gradient(90deg, #059669, #7C3AED)" }}>
        📋 View Brand Guidelines
      </Link>
    );

    if (msg.action === "open_mockup") return (
      <Link to="/mockup_generator"
        className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition shadow"
        style={{ background: "linear-gradient(90deg, #f59e0b, #ec4899)" }}>
        👕 Open Mockup Studio
      </Link>
    );

    return null;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      <button
        className="bg-white shadow-2xl rounded-full p-1 transform transition-all hover:scale-110 active:scale-95 ring-2 ring-purple-200 hover:ring-purple-400"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with BrandyBot"
      >
        <img src={chatbotIcon} alt="BrandyBot" className="h-12 w-12 rounded-full" />
      </button>

      {/* Chat Window */}
      <div
        className={`absolute bottom-20 right-0 rounded-2xl shadow-2xl transition-all duration-300 ${isOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"}`}
        style={{ width: 340, maxHeight: 560, display: "flex", flexDirection: "column", background: bg, border }}
      >
        {/* Header */}
        <div className="p-4 rounded-t-2xl flex items-center justify-between flex-shrink-0"
             style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}>
          <div className="flex items-center gap-2">
            <img src={chatbotIcon} alt="BrandyBot" className="h-7 w-7 rounded-full bg-white/20 p-0.5" />
            <div>
              <p className="font-semibold text-white text-sm">BrandyBot</p>
              <p className="text-purple-200 text-xs">AI Branding Co-Pilot</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <button onClick={handleLogoAgent} title="Open Logo Agent"
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl px-2 py-1 text-xs transition">
                Full Agent ↗
              </button>
            ) : (
              <Link to="/login" className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl px-2 py-1 text-xs transition">
                Sign In ↗
              </Link>
            )}
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1 transition text-sm">✕</button>
          </div>
        </div>

        {/* Guest notice */}
        {!user && (
          <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0 text-xs"
               style={{ background: isDark ? "rgba(124,58,237,0.1)" : "#faf5ff", color: isDark ? "#a78bfa" : "#7c3aed", borderBottom: `1px solid ${isDark ? "#2a2a45" : "#e9d5ff"}` }}>
            <span>✨ Chatting as guest —</span>
            <button onClick={() => handleGuestLoginHandoff("general")} className="font-semibold underline">Sign in</button>
            <span>to save & generate logos</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
          {(messages || []).map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "bot" && (
                <img src={chatbotIcon} className="h-6 w-6 rounded-full mr-2 mt-1 flex-shrink-0" alt="bot" />
              )}
              <div className="max-w-[78%]">
                <span
                  className="block px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={msg.sender === "user"
                    ? { background: "linear-gradient(135deg, #7C3AED, #3B82F6)", color: "#fff", borderRadius: "18px 18px 4px 18px" }
                    : { ...botBubble, borderRadius: "18px 18px 18px 4px" }
                  }
                >
                  {msg.sender === "bot" ? renderMarkdown(msg.text) : msg.text}
                </span>
                {renderActionButton(msg)}
              </div>
            </div>
          ))}

          {isBotTyping && (
            <div className="flex justify-start">
              <img src={chatbotIcon} className="h-6 w-6 rounded-full mr-2 mt-1 flex-shrink-0" alt="bot" />
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center" style={botBubble}>
                {[0, 150, 300].map(d => (
                  <div key={d} className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: textMuted, animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick actions — shown on first open only */}
        {(messages || []).length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
            {quickActions.map((a, i) => (
              <button key={i} onClick={() => sendMessage(a.message)}
                className="px-2.5 py-1 rounded-full text-xs font-medium hover:bg-purple-100 transition border"
                style={{ background: isDark ? "rgba(124,58,237,0.15)" : "#f3e8ff", borderColor: isDark ? "#4c1d95" : "#ddd6fe", color: isDark ? "#a78bfa" : "#6d28d9" }}>
                {a.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 flex gap-2 flex-shrink-0" style={{ borderTop: `1px solid ${isDark ? "#2a2a45" : "#e9d5ff"}` }}>
          <input
            type="text"
            placeholder={user ? "Ask about logos, brands..." : "Ask me about branding..."}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage(input)}
            className="flex-1 px-3 py-2 text-sm rounded-xl outline-none transition"
            style={{ background: msgInput, border: `1px solid ${inputBorder}`, color: isDark ? "#f1f1f5" : "#1a1a2e" }}
          />
          <button onClick={() => sendMessage(input)} disabled={isBotTyping || !input.trim()}
            className="px-3 py-2 text-white rounded-xl hover:opacity-90 transition disabled:opacity-40 text-sm flex-shrink-0"
            style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
