import { useState, useRef, useEffect } from "react";
import chatbotIcon from "../assets/chatbot.png";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today? 😊" },
  ]);
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    const userMessage = { sender: "user", text };
    setMessages([...messages, userMessage]);
    setInput("");

    setIsBotTyping(true);
    setTimeout(() => {
      let botReply = "I'm still learning! 🤖 Ask me anything!";
      let actionInstruction = "";

      const lower = text.toLowerCase();

      if (lower.includes("logo") || lower === "generate logo") {
        botReply = "Sure! I can generate a logo for you! 🎨";
        actionInstruction = "Click the 'Logo Generator' menu to start designing your logo!";
      } else if (lower.includes("guideline") || lower === "show brand guidelines") {
        botReply = "I can create brand guidelines in seconds! 📄";
        actionInstruction = "Go to the 'Brand Guidelines' section to preview and download them!";
      } else if (lower.includes("mockup") || lower === "create mockup") {
        botReply = "Mockups coming right up! 🖼️";
        actionInstruction = "Open the 'Mockup Generator' to visualize your brand!";
      } else if (lower.includes("hello") || lower === "say hello") {
        botReply = "Hi there! How can I help you today? 😊";
      }

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botReply },
        ...(actionInstruction ? [{ sender: "bot", text: actionInstruction }] : []),
      ]);
      setIsBotTyping(false);
    }, 1200);
  };

  const quickActions = ["Generate Logo", "Show Brand Guidelines", "Create Mockup", "Say Hello"];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chatbot Button */}
      <button
        className="bg-white shadow-xl rounded-full p-4 transform transition-transform hover:scale-110 hover:shadow-2xl active:scale-95"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src={chatbotIcon} alt="Chatbot Icon" className="h-12 w-12" />
      </button>

      {/* Chatbot Window */}
      <div
        className={`fixed bottom-20 right-6 w-80 bg-white/90 backdrop-blur-md shadow-2xl rounded-lg border border-gray-200 transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={chatbotIcon} alt="BrandyBot" className="h-5 w-5" />
            <span className="font-semibold">BrandyBot</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-800 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all"
            title="Close Chatbot"
          >
            ✖
          </button>
        </div>

        {/* Chat Messages */}
        <div className="p-4 h-64 overflow-y-auto flex flex-col gap-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <span
                className={`px-4 py-2 rounded-lg shadow-md max-w-[70%] break-words ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white hover:bg-blue-600 transition"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                }`}
              >
                {msg.text}
              </span>
            </div>
          ))}
          {isBotTyping && (
            <div className="flex justify-start">
              <span className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 animate-pulse shadow-md">
                BrandyBot is typing...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Buttons */}
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {quickActions.map((action, i) => (
            <button
              key={i}
              className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm hover:bg-purple-200 transition"
              onClick={() => sendMessage(action)}
            >
              {action}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t flex bg-white rounded-b-lg">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          />
          <button
            className="bg-purple-600 text-white px-4 rounded-r-lg hover:bg-purple-700 transition"
            onClick={() => sendMessage(input)}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
