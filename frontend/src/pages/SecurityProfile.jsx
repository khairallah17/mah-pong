import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Security() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New password and confirmation do not match!");
      return;
    }
    // Add your password update logic here
    console.log("Updating password...");
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'old':
        setShowOldPassword(!showOldPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-blue-800 to-indigo-900 rounded-lg max-w-7xl mx-auto p-8 space-y-4">
      <h2 className="text-xl font-inter text-white">Security</h2>
      <p className="text-xl font-normal text-gray-500">Secure your account</p>
      <form onSubmit={handleUpdatePassword} className="space-y-6 pt-8 border-t border-white/80">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="old-password" className="block text-sm text-white/70 mb-2">Old Password</label>
            <div className="relative">
              <input
                id="old-password"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all"
                placeholder="Enter old password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('old')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="new-password" className="block text-sm text-white/70 mb-2">New Password</label>
            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="confirm-password" className="block text-sm text-white/70 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
        <button type="submit" className="px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors">
          Update Password
        </button>
      </form>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">Two-Factor Authentication (2FA)</h3>
        <p className="text-gray-500">
          Use an authenticator app and scan the QR code, or{" "}
          <button className="text-red-500 hover:underline">
            click here
          </button>{" "}
          to copy the code and setup manually.
        </p>

        <div className="space-y-6 pt-8 border-t border-white/80">
          <p className="text-sm font-Inter text-gray-500">
            Use a phone app like 1Password, Authy, LastPass Authenticator, or Microsoft Authenticator, etc. to get 2FA codes when prompted during sign-in.
          </p>
          <div className="flex items-center p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-yellow-500">Re-scan the QR code to update your 2FA settings</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="flex-1 w-full">
            <h4 className="text-lg mb-4 text-white">Verify the code from the app</h4>
            <input
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all mb-4"
              placeholder="Enter 2FA code"
            />
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors">
                Verify & Enable
              </button>
              <button className="px-6 py-2 bg-[#BD3944] text-white rounded-lg hover:bg-red-600 transition-colors">
                Disable 2FA
              </button>
            </div>
          </div>
          <div className="w-full md:w-40 h-40 bg-white p-2 rounded-md">
            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-500">
              <img 
                className="w-full h-full object-scale-down" 
                src="https://user-images.githubusercontent.com/23690145/83348739-c4f88d00-a361-11ea-932e-e722e0bd1b65.png" 
                alt="QR Code"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

