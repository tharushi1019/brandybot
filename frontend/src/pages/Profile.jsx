import { useState, useEffect } from "react";
import { FiCamera, FiEdit2, FiSave, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { getUserBrands } from "../services/guidelineService";
import { updateUserProfile } from "../services/authService";

export default function Profile() {
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  // 🔹 Firebase user (from AuthContext)
  const { user } = useAuth();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
      fetchBrands();
    }
  }, [user]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await getUserBrands();
      setBrands(response.data || []);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      await updateUserProfile({
        displayName: displayName,
        photoURL: photoURL
      });
      setIsEditing(false);
      // Force reload or just let AuthContext update naturally (might need page refresh to see changes if context doesn't auto-update immediately)
      // Usually AuthContext listens to onAuthStateChanged, which triggers on updateProfile? No, updateProfile doesn't always trigger listener immediately.
      // But for UI feedback:
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update profile: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6 rounded-2xl shadow-lg mb-8 text-white">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="opacity-90 mt-1">
          Manage your account and view your branding history
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl mx-auto border border-gray-100">
        {/* User Info */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <img
              src={photoURL || defaultAvatar}
              alt="User Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-100 shadow-md transition group-hover:border-purple-300"
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white cursor-pointer" title="Change Photo URL">
                <FiCamera size={24} />
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-6 w-full max-w-sm space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Photo URL</label>
                <input
                  type="text"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div className="flex gap-2 justify-center mt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                >
                  <FiX /> Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  {updating ? "Saving..." : <><FiSave /> Save Changes</>}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mt-4 flex items-center gap-2">
                {user?.displayName || "User"}
                <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-purple-600 transition">
                  <FiEdit2 size={16} />
                </button>
              </h2>
              <p className="text-gray-500 font-medium">
                {user?.email || "No email available"}
              </p>
            </>
          )}
        </div>

        {/* Divider */}
        <hr className="my-8 border-gray-100" />

        {/* Branding History */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 p-2 rounded-lg text-sm">HISTORY</span>
            Branding Projects
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">You haven’t created any branding projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-lg transition bg-white group cursor-default"
                >
                  <img
                    src={brand.logo?.primaryLogoUrl || '/brandybot_icon.png'}
                    alt={brand.brand_name}
                    className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 object-contain p-1"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg group-hover:text-purple-600 transition">
                      {brand.brand_name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Created on {brand.created_at ? new Date(brand.created_at).toLocaleDateString() : ''}
                    </p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md font-medium">
                      {brand.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
