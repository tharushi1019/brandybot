import { useState } from "react";
import { FiCamera } from "react-icons/fi";

export default function Profile() {
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  const [userImage, setUserImage] = useState("");
  const [name, setName] = useState("User Name");
  const [email, setEmail] = useState("user@example.com");

  return (
    <div className="p-6">
      {/* Page Title */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6 rounded-lg shadow-lg mb-8">
        <h1 className="text-3xl font-bold text-white">Your Profile</h1>
        <p className="text-purple-100 mt-1 text-sm">Manage your personal details</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={userImage || defaultAvatar}
              alt="User Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-md"
            />

            {/* Camera Icon */}
            <label className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition">
              <FiCamera />
              <input type="file" className="hidden" />
            </label>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mt-4">{name}</h2>
          <p className="text-gray-500 text-sm">{email}</p>
        </div>

        {/* Edit Form */}
        <div className="mt-8 space-y-6">
          <div>
            <label className="text-gray-700 font-medium">Full Name</label>
            <input
              className="w-full mt-2 p-3 rounded-lg border shadow-sm focus:ring-2 focus:ring-purple-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium">Email Address</label>
            <input
              className="w-full mt-2 p-3 rounded-lg border shadow-sm focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>

          <button className="w-full bg-purple-600 text-white py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-purple-700 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
