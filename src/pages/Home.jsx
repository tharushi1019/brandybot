import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Chatbot from "../components/Chatbot";
import FeatureCard from "../components/FeatureCard";
import { PencilIcon, CubeIcon, DocumentTextIcon, DeviceTabletIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const howItWorks = [
    { step: 1, title: "Enter Brand Details", icon: <PencilIcon className="h-12 w-12 text-purple-600 mb-2" /> },
    { step: 2, title: "Generate AI Logo", icon: <CubeIcon className="h-12 w-12 text-purple-600 mb-2" /> },
    { step: 3, title: "Create Brand Guidelines", icon: <DocumentTextIcon className="h-12 w-12 text-purple-600 mb-2" /> },
    { step: 4, title: "Preview Mockups", icon: <DeviceTabletIcon className="h-12 w-12 text-purple-600 mb-2" /> },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center p-6 md:px-16 bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md">
        <div className="flex items-center">
          <img src="/brandybot_icon.png" alt="BrandyBot Logo" className="h-10 w-10 mr-3" />
          <div>
            <h1 className="text-3xl font-bold"><Link to="/">BrandyBot</Link></h1>
            <span className="text-sm text-gray-200 hidden md:inline">Smart AI for Your Brand</span>
          </div>
        </div>
        <div className="flex items-center">
          <Link to="/login" className="mr-4 px-5 py-2 border border-white rounded-lg hover:bg-white hover:text-purple-600 transition transform hover:scale-105">
            Login
          </Link>
          <Link to="/signup" className="px-5 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-100 transition transform hover:scale-105">
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.header 
        className="text-center mt-20 px-6"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
          AI-Enhanced Branding Made Simple 🚀
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          BrandyBot helps you create stunning logos, brand guidelines, and mockups with AI.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/signup" className="px-8 py-3 bg-purple-600 text-white text-lg rounded-lg shadow-md hover:bg-purple-700 transition transform hover:scale-105">
            Get Started for Free
          </Link>
          <Link to="/demo" className="px-8 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition transform hover:scale-105">
            Watch Demo
          </Link>
        </div>
        <img src="/hero_preview.png" alt="BrandyBot Preview" className="mx-auto mt-12 w-full max-w-3xl rounded-lg shadow-xl" />
      </motion.header>

      {/* Features Section */}
      <motion.section 
        className="mt-24 px-6 md:px-16 grid md:grid-cols-3 gap-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <FeatureCard 
          title="AI Logo Generator" 
          description="Create a professional logo in seconds with AI." 
          to="/logo_generator" 
        />
        <FeatureCard 
          title="Brand Guidelines" 
          description="Get a complete brand identity with one click." 
          to="/brand_guidelines" 
        />
        <FeatureCard 
          title="Mockup Generator" 
          description="Preview your brand on real-world products." 
          to="/mockup_generator" 
        />
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        className="mt-32 px-6 md:px-16 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl py-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">How BrandyBot Works</h3>
        <div className="grid md:grid-cols-4 gap-8">
          {howItWorks.map(({ step, title, icon }) => (
            <motion.div 
              key={step} 
              className="flex flex-col items-center p-6 bg-white rounded-xl shadow hover:shadow-lg transition transform hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: step * 0.2 }}
            >
              <div className="text-purple-600 font-bold text-2xl mb-4">{step}</div>
              {icon}
              <p className="text-gray-700 text-center">{title}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        className="mt-32 px-6 md:px-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">What Users Say</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { text: "BrandyBot saved us hours of design work!", name: "Alex, Startup Founder" },
            { text: "Our brand looks professional thanks to AI.", name: "Priya, Freelancer" },
            { text: "Easy, fast, and impressive results every time.", name: "Raj, Small Business Owner" },
          ].map(({ text, name }, i) => (
            <motion.div 
              key={i} 
              className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg transition transform hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
            >
              <p className="text-gray-700 text-center">{text}</p>
              <span className="block mt-4 font-semibold text-gray-900 text-center">{name}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm mt-16 py-6 border-t bg-gray-50">
        <div className="mb-2">© 2025 BrandyBot. All rights reserved.</div>
        <div className="flex justify-center gap-4 mt-2">
          <a href="#" className="hover:text-purple-600 transition">LinkedIn</a>
          <a href="#" className="hover:text-purple-600 transition">GitHub</a>
          <a href="#" className="hover:text-purple-600 transition">Twitter</a>
        </div>
      </footer>

      {/* Chatbot Floating Button */}
      <div className="fixed bottom-6 right-6">
        <Chatbot />
      </div>
    </div>
  );
}
