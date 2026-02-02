import { useState } from "react";
import { FiHome, FiSettings, FiUser, FiLogOut } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Get authenticated user info
  const { user } = useAuth();


  const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  // Mock dashboard data (backend later)
  const stats = {
    logosGenerated: 3,
    brandsCreated: 1,
  };

  const lastBrand = {
    brandName: "HappyPaws",
    logo: "/src/assets/logos/selected_logo.png",
    date: "Jan 10, 2025",
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-br from-purple-600 to-blue-500 text-white w-64 p-5 ${
          isSidebarOpen ? "block" : "hidden"
        } md:block`}
      >
        <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center">
          <img
            src="/brandybot_icon.png"
            alt="BrandyBot Icon"
            className="inline-block w-8 h-8 mr-2"
          />
          <Link to="/">BrandyBot</Link>
        </h2>

        <nav>
          <ul className="space-y-4">
            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:text-purple-600 transition"
              >
                <FiHome className="text-lg" /> Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:text-purple-600 transition"
              >
                <FiUser className="text-lg" /> Profile
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:text-purple-600 transition"
              >
                <FiSettings className="text-lg" /> Settings
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:text-red-600 transition w-full"
              >
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
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome back, {user?.displayName || "User"} 👋
          </h1>

          <button
            className="md:hidden text-gray-600"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>

          <div className="flex items-center gap-3">
            <img
              src={user?.photoURL || defaultAvatar}
              alt="User Profile"
              className="w-10 h-10 rounded-full border-2 border-purple-500 object-cover"
            />
            <span className="font-medium text-gray-700">{user.name}</span>
          </div>
        </header>

        {/* User Stats */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-purple-500">
            <p className="text-sm text-gray-500">Logos Generated</p>
            <p className="text-3xl font-bold">{stats.logosGenerated}</p>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Brands Created</p>
            <p className="text-3xl font-bold">{stats.brandsCreated}</p>
          </div>
        </section>

        {/* Last Activity */}
        <section className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Last Branding Activity
          </h2>

          <div className="flex items-center gap-4">
            <img
              src={lastBrand.logo}
              alt="Last Logo"
              className="w-20 h-20 rounded-lg border"
            />
            <div>
              <p className="font-semibold text-lg">{lastBrand.brandName}</p>
              <p className="text-sm text-gray-500">
                Generated on {lastBrand.date}
              </p>
            </div>
          </div>
        </section>

        {/* Navigation Actions */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Continue Building Your Brand
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/logo_generator"
              className="bg-gradient-to-br from-pink-500 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:scale-105 transition"
            >
              <h3 className="text-lg font-bold">Generate New Logo</h3>
              <p className="text-sm text-gray-200">
                Start a new logo design for your brand.
              </p>
            </Link>

            <Link
              to="/brand_guidelines"
              className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:scale-105 transition"
            >
              <h3 className="text-lg font-bold">View Brand Guidelines</h3>
              <p className="text-sm text-gray-200">
                Review fonts, colors, and usage rules.
              </p>
            </Link>

            <Link
              to="/mockup_generator"
              className="bg-gradient-to-br from-yellow-500 to-pink-500 text-white p-6 rounded-lg shadow-lg hover:scale-105 transition"
            >
              <h3 className="text-lg font-bold">View Mockups</h3>
              <p className="text-sm text-gray-200">
                See your brand applied to real-world designs.
              </p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
