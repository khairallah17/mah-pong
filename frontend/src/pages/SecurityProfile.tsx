import React, { useState } from 'react';

export default function Security() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  return (
    <div className="w-full max-w-4xl mx-auto p-8 space-y-4">
      <h2 className="text-xl font-inter text-white">Security</h2>
      <p className="text-xl font-normal text-gray-500">Secure your account</p>
      <div className="space-y-6 pt-8 border-t border-white/80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-white/70 mb-2">Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all mb-4"
              placeholder="**************"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all mb-4"
              placeholder="**************"
            />
          </div>
        </div>
        <button className="px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors">
          Update Password
        </button>
      </div>

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
          <p className="text-sm font-Inter text-gray-500"> Use a phone app like 1Password, Authy, LastPass Authenticator, or Microsoft Authenticator, etc. to get 2FA codes when prompted during sign-in. </p>
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
              placeholder="**************"
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
            {/* Placeholder for QR code */}
            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-500">
              <img className="w-full h-full object-scale-down"
                src="https://user-images.githubusercontent.com/23690145/83348739-c4f88d00-a361-11ea-932e-e722e0bd1b65.png"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}