import { useState } from "react";
import { changePassword } from "../services/authService";

export default function Settings() {
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      alert("Passwords do not match!");
      return;
    }
    if (passwords.new.length < 6) {
      alert("Password should be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await changePassword(passwords.new);
      alert("Password updated successfully!");
      setPasswords({ new: "", confirm: "" });
    } catch (error) {
      console.error("Password change failed:", error);
      alert("Failed to update password: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Page Title */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6 rounded-2xl shadow-lg mb-8 text-white">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="opacity-90 mt-1">Customize your BrandyBot experience</p>
      </div>

      {/* Settings Container */}
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-3xl mx-auto space-y-8 border border-gray-100">

        {/* Account Settings */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Account Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="text-gray-700 font-medium block mb-1">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
              />
            </div>

            <div>
              <label className="text-gray-700 font-medium block mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handlePasswordChange}
                disabled={loading || !passwords.new}
                className={`w-full bg-purple-600 text-white py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-purple-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>

        {/* Notification Preferences (Mock for now) */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Notifications</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 text-purple-600 rounded bg-gray-100 border-gray-300 focus:ring-purple-500" defaultChecked />
              <div>
                <p className="font-medium text-gray-800">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive updates about your projects</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 text-purple-600 rounded bg-gray-100 border-gray-300 focus:ring-purple-500" />
              <div>
                <p className="font-medium text-gray-800">Marketing Emails</p>
                <p className="text-xs text-gray-500">Receive news and special offers</p>
              </div>
            </label>
          </div>

          <button className="w-full mt-4 bg-gray-100 text-gray-600 py-3 rounded-xl text-lg font-semibold hover:bg-gray-200 transition">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
