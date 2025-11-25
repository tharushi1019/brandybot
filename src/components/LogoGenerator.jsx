import { useState, useRef, useEffect } from "react";

export default function LogoGenerator() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm BrandyBot 👋 Let's design your perfect logo. Tell me your brand name to get started!",
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const botMessage = {
      sender: "bot",
      text: "Great! Let me analyze that and ask a few more questions…",
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, botMessage]);
    }, 700);

    setInput("");
  };

  // Auto scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-4 rounded-3xl text-sm shadow-md border border-gray-100 ${
                msg.sender === "user"
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
