import { Link } from "react-router-dom";
import Chatbot from "../components/Chatbot";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center p-6 md:px-16 bg-gradient-to-r from-purple-600 to-blue-500 text-white">
        <div className="flex items-center">
          <img src="/brandybot_icon.png" alt="BrandyBot Logo" className="h-10 w-10 mr-3" />
          <h1 className="text-3xl font-bold">BrandyBot</h1>
        </div>
        <div>
          <Link to="/login" className="mr-4 px-5 py-2 border border-white rounded-lg hover:bg-white hover:text-purple-600 transition">Login</Link>
          <Link to="/signup" className="px-5 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-100 transition">Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="text-center mt-20 px-6">
        <h2 className="text-5xl font-bold text-gray-900 leading-tight">
          AI-Enhanced Branding Made Simple 🚀
        </h2>
        <p className="text-lg text-gray-600 mt-4">
          BrandyBot helps you create stunning logos, brand guidelines, and mockups with AI.
        </p>
        <div className="mt-8">
          <Link to="/signup" className="px-8 py-3 bg-purple-600 text-white text-lg rounded-lg shadow-md hover:bg-purple-700 transition">
            Get Started for Free
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="mt-24 px-6 md:px-16 grid md:grid-cols-3 gap-8">
        <div className="bg-white shadow-md p-6 rounded-lg text-center">
          <h3 className="text-2xl font-semibold text-purple-600">AI Logo Generator</h3>
          <p className="text-gray-600 mt-2">Create a professional logo in seconds with AI.</p>
        </div>
        <div className="bg-white shadow-md p-6 rounded-lg text-center">
          <h3 className="text-2xl font-semibold text-purple-600">Brand Guidelines</h3>
          <p className="text-gray-600 mt-2">Get a complete brand identity with one click.</p>
        </div>
        <div className="bg-white shadow-md p-6 rounded-lg text-center">
          <h3 className="text-2xl font-semibold text-purple-600">Mockup Generator</h3>
          <p className="text-gray-600 mt-2">Preview your brand on real-world products.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm mt-16 py-6 border-t">
        © 2025 BrandyBot. All rights reserved.
      </footer>

      {/* Chatbot Floating Button */}
      <div className="fixed bottom-6 right-6">
        <Chatbot />
      </div>
    </div>
  );
}
