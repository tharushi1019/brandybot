import { useState, useEffect } from "react";
import { FiHome, FiSettings, FiUser, FiLogOut, FiPlus, FiImage } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { getUserBrands } from "../services/guidelineService";
import { getLogoHistory } from "../services/logoService";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState({ logosGenerated: 0, brandsCreated: 0 });
  const [recentBrands, setRecentBrands] = useState([]);
  const [allBrands, setAllBrands] = useState([]); // Store all brands for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get authenticated user info
  const { user } = useAuth();

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch User Brands
        const brandsResponse = await getUserBrands();
        const brands = brandsResponse.data || [];
        setAllBrands(brands);

        // Fetch Logo History (for count)
        const logosResponse = await getLogoHistory(1, 1); // Limit 1 just to get total count if API supports it, or fetch all
        // Note: Assuming getLogoHistory returns pagination metadata with total count.
        // If not, we might need a separate endpoint for stats or fetch all.
        // For now, let's assume we can get a list or count.
        // Let's actually fetch a small page to check existence.
        // To get accurate count, the backend should ideally return it.
        // Based on Phase 4, getLogoHistory returns { success: true, count: number, data: [] }

        setStats({
          logosGenerated: logosResponse.pagination?.total ?? logosResponse.count ?? 0,
          brandsCreated: brands.length
        });

        // Set recent brands initially
        setRecentBrands(brands);

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Handle Search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setRecentBrands(allBrands.slice(0, 6)); // Show top 6 by default? Or all? Let's show filtered list.
      // Actually, let's just use one list for display.
      // If query is empty, allow showing all (or top N).
      // Let's make "recentBrands" actually act as "filteredBrands".
      setRecentBrands(allBrands);
    } else {
      const filtered = allBrands.filter(brand =>
        (brand.brand_name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      setRecentBrands(filtered);
    }
  }, [searchQuery, allBrands]);

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
        className={`bg-gradient-to-br from-purple-600 to-blue-500 text-white w-64 p-5 ${isSidebarOpen ? "block" : "hidden"
          } md:block transition-all duration-300`}
      >
        <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
          <img
            src="/brandybot_icon.png"
            alt="BrandyBot Icon"
            className="w-8 h-8 rounded-full bg-white p-1"
          />
          <Link to="/">BrandyBot</Link>
        </h2>

        <nav>
          <ul className="space-y-2">
            <li>
              <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-xl bg-white/10 text-white font-medium shadow-sm border border-white/20">
                <FiHome className="text-lg" /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/logo_history" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 hover:text-white transition opacity-90 hover:opacity-100">
                <FiImage className="text-lg" /> My Logos
              </Link>
            </li>
            <li>
              <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 hover:text-white transition opacity-90 hover:opacity-100">
                <FiUser className="text-lg" /> Profile
              </Link>
            </li>
            <li>
              <Link to="/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 hover:text-white transition opacity-90 hover:opacity-100">
                <FiSettings className="text-lg" /> Settings
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 hover:text-red-200 transition w-full text-left opacity-90 hover:opacity-100 mt-6">
                <FiLogOut className="text-lg" /> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'there'} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here's what's happening with your brands.</p>
          </div>

          <button
            className="md:hidden text-gray-600"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
            <img
              src={user?.photoURL || defaultAvatar}
              alt="User Profile"
              className="w-12 h-12 rounded-full border-2 border-purple-100 object-cover shadow-sm"
            />
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* User Stats */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Logos</p>
                    <p className="text-4xl font-bold text-gray-800">{stats.logosGenerated}</p>
                  </div>
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                    <FiHome size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Active Brands</p>
                    <p className="text-4xl font-bold text-gray-800">{stats.brandsCreated}</p>
                  </div>
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <FiUser size={24} />
                  </div>
                </div>
              </div>

              <Link to="/logo_generator" className="bg-gradient-to-br from-purple-600 to-blue-500 p-6 rounded-2xl shadow-md text-white flex flex-col justify-center items-center hover:scale-105 transition cursor-pointer">
                <div className="bg-white/20 p-4 rounded-full mb-3">
                  <FiPlus size={32} />
                </div>
                <p className="font-bold text-lg">Create New Brand</p>
              </Link>
            </section>

            {/* Last Activity / Recent Brands */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-800">Your Brands</h2>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>

              {recentBrands.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentBrands.map((brand) => (
                    <div key={brand.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img
                            src="/brandybot_icon.png"
                            alt={brand.brand_name}
                            className="w-10 h-10 object-contain opacity-40"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-800 text-lg truncate">{brand.brand_name}</h3>
                          <p className="text-xs text-gray-500">
                            {brand.updated_at ? new Date(brand.updated_at).toLocaleDateString() : ''}
                          </p>
                          <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-medium capitalize">
                            {brand.status || 'active'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 mb-4">No brands created yet.</p>
                  <Link to="/logo_generator" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                    Start Your First Brand
                  </Link>
                </div>
              )}
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/logo_generator" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition group">
                  <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-800 mb-1">Logo Generator</h3>
                  <p className="text-gray-500 text-xs">AI-powered logo design in minutes.</p>
                </Link>
                <Link to="/logo_history" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition group">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <span className="text-2xl">🗂️</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-800 mb-1">My Logos</h3>
                  <p className="text-gray-500 text-xs">View and reuse your generated logos.</p>
                </Link>
                <Link to="/brand_guidelines" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition group">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <span className="text-2xl">📘</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-800 mb-1">Brand Guidelines</h3>
                  <p className="text-gray-500 text-xs">Export your brand identity kit.</p>
                </Link>
                <Link to="/mockup_generator" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition group">
                  <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <span className="text-2xl">👕</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-800 mb-1">Mockup Generator</h3>
                  <p className="text-gray-500 text-xs">Visualize your brand on products.</p>
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
