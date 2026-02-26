import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import chatbotIcon from "../assets/chatbot.png";
import { sendMessage as sendChatApi } from "../services/chatbotService";
import { useAuth } from "../context/AuthContext";

export default function Chatbot() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(null); // null = not init yet
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize greeting when chat opens for the first time
  useEffect(() => {
    if (isOpen && messages === null) {
      const name = user?.displayName?.split(" ")[0] || null;
      const greeting = name
        ? `Hey ${name}! 👋 I'm BrandyBot — your AI branding assistant. I can help you create logos, brand guidelines, and mockups. What would you like to do?`
        : "Hello! 👋 I'm BrandyBot — your AI branding assistant. I can help you create logos, brand guidelines, and mockups. What would you like to do?";
      setMessages([{ sender: "bot", text: greeting }]);
    }
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isBotTyping]);

  const sendMessage = async (text) => {
    if (!text.trim() || isBotTyping) return;
    setMessages((prev) => [...(prev || []), { sender: "user", text }]);
    setInput("");
    setIsBotTyping(true);

    try {
      const result = await sendChatApi(text, "general");
      const data = result.data;
      const botText = data?.message || "I didn't get that.";
      const action = data?.action;
      const payload = data?.payload;

      setMessages((prev) => [
        ...(prev || []),
        { sender: "bot", text: botText, action, payload },
      ]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...(prev || []),
        { sender: "bot", text: "Sorry, I'm having trouble connecting right now. 🤯 Try again in a moment!" },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const quickActions = [
    { label: "🎨 Generate Logo", message: "I want to create a logo" },
    { label: "📘 Brand Guidelines", message: "Help me with brand guidelines" },
    { label: "👕 Create Mockups", message: "Show me mockup options" },
    { label: "💬 Say Hello", message: "Hello!" },
  ];

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
        className={`absolute bottom-20 right-0 w-84 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-purple-100 transition-all duration-300 ${isOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"
          }`}
        style={{ width: "340px", maxHeight: "520px", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="p-4 rounded-t-2xl flex items-center justify-between flex-shrink-0" style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}>
          <div className="flex items-center gap-2">
            <img src={chatbotIcon} alt="BrandyBot" className="h-7 w-7 rounded-full bg-white/20 p-0.5" />
            <div>
              <p className="font-semibold text-white text-sm">BrandyBot</p>
              <p className="text-purple-200 text-xs">AI Branding Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Online" />
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1 transition text-sm">✕</button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
          {(messages || []).map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "bot" && (
                <img src={chatbotIcon} className="h-6 w-6 rounded-full mr-2 mt-1 flex-shrink-0" alt="bot" />
              )}
              <div className={`max-w-[75%] ${msg.sender === "user" ? "" : ""}`}>
                <span
                  className={`block px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.sender === "user"
                      ? "text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}
                  style={msg.sender === "user" ? { background: "linear-gradient(135deg, #7C3AED, #6D28D9)" } : {}}
                >
                  {msg.text}
                </span>

                {/* Handle generate_logo action — show CTA button */}
                {msg.action === "generate_logo" && (
                  <Link
                    to="/logo_generator"
                    state={msg.payload}
                    className="mt-2 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition"
                    style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}
                  >
                    🎨 Start Logo Design
                  </Link>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isBotTyping && (
            <div className="flex justify-start">
              <img src={chatbotIcon} className="h-6 w-6 rounded-full mr-2 mt-1 flex-shrink-0" alt="bot" />
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                {[0, 150, 300].map(d => (
                  <div key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick actions — only shown before first user message */}
        {(messages || []).length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => sendMessage(action.message)}
                className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs font-medium hover:bg-purple-100 transition border border-purple-100"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
          <input
            type="text"
            className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isBotTyping || !input.trim()}
            className="px-3 py-2 text-white rounded-xl hover:opacity-90 transition disabled:opacity-40 text-sm"
            style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
