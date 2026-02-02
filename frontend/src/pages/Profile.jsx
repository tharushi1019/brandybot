import { useState } from "react";
import { FiCamera } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  // 🔹 Firebase user (from AuthContext)
  const { user } = useAuth();

  // Optional local override (future avatar upload)
  const [userImage, setUserImage] = useState("");

  // 🔹 Mock branding history (backend later)
  const brandingHistory = [
    {
      brandName: "HappyPaws",
      logo: "/src/assets/logos/logo1.png",
      date: "Jan 10, 2025",
    },
    {
      brandName: "EcoBite",
      logo: "/src/assets/logos/logo2.png",
      date: "Jan 02, 2025",
    },
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6 rounded-lg shadow-lg mb-8">
        <h1 className="text-3xl font-bold text-white">Your Profile</h1>
        <p className="text-purple-100 mt-1 text-sm">
          View your account details and branding history
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
        {/* User Info */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={userImage || user?.photoURL || defaultAvatar}
              alt="User Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-md"
            />

            {/* Avatar Upload (future feature – UI only) */}
            <label className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition">
              <FiCamera />
              <input type="file" className="hidden" />
            </label>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mt-4">
            {user?.displayName || "User"}
          </h2>
          <p className="text-gray-500 text-sm">
            {user?.email || "No email available"}
          </p>
        </div>

        {/* Divider */}
        <hr className="my-8" />

        {/* Branding History */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Branding History
          </h3>

          {brandingHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">
              You haven’t created any branding projects yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brandingHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={item.logo}
                    alt={item.brandName}
                    className="w-16 h-16 rounded-lg border"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {item.brandName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Created on {item.date}
                    </p>
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
