import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Chatbot from "../components/Chatbot";
import FeatureCard from "../components/FeatureCard";
import { useAuth } from "../context/AuthContext";
import {
  PencilIcon,
  CubeIcon,
  DocumentTextIcon,
  DeviceTabletIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  const { user } = useAuth();

  const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  const howItWorks = [
    {
      step: 1,
      title: "Enter Brand Details",
      icon: <PencilIcon className="h-12 w-12 text-purple-600 mb-2" />,
    },
    {
      step: 2,
      title: "Generate AI Logo",
      icon: <CubeIcon className="h-12 w-12 text-purple-600 mb-2" />,
    },
    {
      step: 3,
      title: "Create Brand Guidelines",
      icon: <DocumentTextIcon className="h-12 w-12 text-purple-600 mb-2" />,
    },
    {
      step: 4,
      title: "Preview Mockups",
      icon: <DeviceTabletIcon className="h-12 w-12 text-purple-600 mb-2" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center p-6 md:px-16 bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md">
        <div className="flex items-center">
          <img
            src="/brandybot_icon.png"
            alt="BrandyBot Logo"
            className="h-10 w-10 mr-3"
          />
          <div>
            <h1 className="text-3xl font-bold">
              <Link to="/">BrandyBot</Link>
            </h1>
            <span className="text-sm text-gray-200 hidden md:inline">
              Smart AI for Your Brand
            </span>
          </div>
        </div>

        {/* RIGHT SIDE NAV */}
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-5 py-2 border border-white rounded-lg hover:bg-white hover:text-purple-600 transition transform hover:scale-105"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-100 transition transform hover:scale-105"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="px-5 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-100 transition transform hover:scale-105"
              >
                Dashboard
              </Link>

              <div className="flex items-center gap-2">
                <img
                  src={user?.photoURL || defaultAvatar}
                  alt="User Avatar"
                  className="w-9 h-9 rounded-full border-2 border-white object-cover"
                />
                <span className="font-medium hidden md:inline">
                  {user?.displayName || "User"}
                </span>
              </div>
            </>
          )}
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
          BrandyBot helps you create stunning logos, brand guidelines, and
          mockups with AI.
        </p>

        <div className="flex justify-center gap-4">
          {!user ? (
            <Link
              to="/signup"
              className="px-8 py-3 bg-purple-600 text-white text-lg rounded-lg shadow-md hover:bg-purple-700 transition transform hover:scale-105"
            >
              Get Started for Free
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-purple-600 text-white text-lg rounded-lg shadow-md hover:bg-purple-700 transition transform hover:scale-105"
            >
              Go to Dashboard
            </Link>
          )}
        </div>

        <img
          src="/hero_preview.png"
          alt="BrandyBot Preview"
          className="mx-auto mt-12 w-full max-w-3xl rounded-lg shadow-xl"
        />
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

      {/* How It Works */}
      <motion.section
        className="mt-32 px-6 md:px-16 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl py-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
          How BrandyBot Works
        </h3>

        <div className="grid md:grid-cols-4 gap-8">
          {howItWorks.map(({ step, title, icon }) => (
            <motion.div
              key={step}
              className="flex flex-col items-center p-6 bg-white rounded-xl shadow hover:shadow-lg transition transform hover:scale-105"
            >
              <div className="text-purple-600 font-bold text-2xl mb-4">
                {step}
              </div>
              {icon}
              <p className="text-gray-700 text-center">{title}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm mt-16 py-6 border-t bg-gray-50">
        © 2025 BrandyBot. All rights reserved.
      </footer>

      {/* Chatbot */}
      <div className="fixed bottom-6 right-6">
        <Chatbot />
      </div>
    </div>
  );
}
