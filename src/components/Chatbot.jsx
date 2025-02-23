import { useState } from "react";
import chatbotIcon from "../assets/chatbot.png"; // Import chatbot image

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today? 😊" },
  ]);
  const [input, setInput] = useState("");

  // Handle message submission
  const sendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);

    // Simulate bot reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "I'm still learning! 🤖 Ask me anything!" },
      ]);
    }, 1000);

    setInput(""); // Clear input field
  };

  return (
    <div className="fixed bottom-6 right-6">
      {/* Chatbot Floating Button */}
      <button
        className="bg-white shadow-lg rounded-full p-4 transition-transform transform hover:scale-110"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src={chatbotIcon} // Use imported image
          alt="Chatbot Icon"
          className="h-12 w-12"
        />
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="w-80 bg-white/80 backdrop-blur-md shadow-xl rounded-lg fixed bottom-20 right-6 border border-gray-200">
          {/* Chatbot Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center">
          <img src={chatbotIcon} alt="BrandyBot" className="h-5 w-5 mr-3" /> 
            <span className="font-semibold">BrandyBot</span>
          </div>
            <button onClick={() => setIsOpen(false)} className="text-xl">✖</button>
          </div>

          {/* Chat Messages */}
          <div className="p-4 h-60 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 text-sm flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <span
                  className={`px-4 py-2 rounded-lg shadow ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t flex bg-white">
            <input
              type="text"
              className="w-full p-2 border rounded-l-lg focus:outline-none text-gray-800"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="bg-purple-600 text-white px-4 rounded-r-lg hover:bg-purple-700 transition"
              onClick={sendMessage}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
