export default function Settings() {
  return (
    <div className="p-6">
      {/* Page Title */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6 rounded-lg shadow-lg mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-purple-100 mt-1 text-sm">Customize your BrandyBot experience</p>
      </div>

      {/* Settings Container */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto space-y-8">
        
        {/* Account Settings */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-700 font-medium">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full mt-2 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-gray-700 font-medium">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full mt-2 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>

          <select className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500">
            <option>Email Only</option>
            <option>SMS Only</option>
            <option>Email & SMS</option>
          </select>
        </div>

        {/* Save Button */}
        <button className="w-full bg-purple-600 text-white py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-purple-700 transition">
          Save Settings
        </button>
      </div>
    </div>
  );
}
