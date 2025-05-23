import { useState } from "react";
import { FiHome, FiSettings, FiUser, FiLogOut } from "react-icons/fi";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-gradient-to-br from-purple-600 to-blue-500 text-white w-64 p-5 ${isSidebarOpen ? "block" : "hidden"} md:block`}>
        <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center">
          <img src="/brandybot_icon.png" alt="BrandyBot Icon" className="inline-block w-8 h-8 mr-2" />
          <Link to="/">BrandyBot</Link>
        </h2>
        <nav>
          <ul className="space-y-4">
            <li>
              <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:text-purple-600 transition">
                <FiHome className="text-lg" /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:text-purple-600 transition">
                <FiUser className="text-lg" /> Profile
              </Link>
            </li>
            <li>
              <Link to="/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:text-purple-600 transition">
                <FiSettings className="text-lg" /> Settings
              </Link>
            </li>
            <li>
              <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:text-red-600 transition w-full">
                <FiLogOut className="text-lg" /> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <button className="md:hidden text-gray-600" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            ☰
          </button>
          <div className="flex items-center gap-3">
            <img src="https://via.placeholder.com/40" alt="User" className="w-10 h-10 rounded-full border-2 border-purple-500" />
            <span className="font-medium text-gray-700">Hello, User</span>
          </div>
        </header>

        {/* Dashboard Stats */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg shadow-md flex items-center gap-4 border-l-4 border-pink-500">
            <span className="text-3xl font-bold">250+</span>
            <p className="text-gray-500">Logos Generated</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md flex items-center gap-4 border-l-4 border-blue-500">
            <span className="text-3xl font-bold">100+</span>
            <p className="text-gray-500">Brand Guidelines Created</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md flex items-center gap-4 border-l-4 border-yellow-500">
            <span className="text-3xl font-bold">80%</span>
            <p className="text-gray-500">User Satisfaction</p>
          </div>
        </section>

        {/* AI Branding Tools Section */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700">AI Branding Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold">AI Logo Generator</h3>
              <p className="text-sm text-gray-200">Create stunning logos instantly.</p>
              <button className="mt-3 bg-white text-pink-500 px-4 py-2 rounded-lg font-semibold hover:opacity-90">
                Generate
              </button>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold">AI Brand Guideline</h3>
              <p className="text-sm text-gray-200">Define your brand identity easily.</p>
              <button className="mt-3 bg-white text-blue-500 px-4 py-2 rounded-lg font-semibold hover:opacity-90">
                Generate
              </button>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-pink-500 text-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold">Mockup Generator</h3>
              <p className="text-sm text-gray-200">Visualize your brand in real-world settings.</p>
              <button className="mt-3 bg-white text-yellow-500 px-4 py-2 rounded-lg font-semibold hover:opacity-90">
                Generate
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
