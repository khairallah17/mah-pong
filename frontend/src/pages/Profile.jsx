import React, { useState } from 'react';
import googleImage from '../images/google.svg';
import intraImage from '../images/intraImage.webp';

export default function Profile() {
  const [firstName, setFirstName] = useState("ZOUHAIR");
  const [lastName, setLastName] = useState("LAAROUSSI");
  const [username, setUsername] = useState("@ zlaarous");
  const [email, setEmail] = useState("zlaarous@1337.com");

  return (
    <div className="w-full max-w-4xl mx-auto p-8 space-y-8">
      <h2 className="text-2xl font-inter text-white mb-6">Account</h2>
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-inter">
            {firstName[0]}{lastName[0]}
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-inter text-white text-xl">Profile Picture</h3>
            <p className="text-sm text-white/70">PNG, JPEG under 15MB</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <label className="px-6 py-2 bg-white text-black rounded-md hover:bg-white/90 transition-colors cursor-pointer">
                <input type="file" className="hidden" accept="image/*" />
                Upload an image
              </label>
              <button className="px-6 py-2 bg-[#BD3944] text-white rounded-md hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <img
            src="https://github.com/shadcn.png"
            alt="Wolf Avatar"
            className="w-20 h-20 rounded-full border-2 border-white/80"
          />
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-inter text-white text-sm">Profile Avatar</h3>
            <button className="px-2 py-2 bg-white text-black rounded-md hover:bg-white/50 transition-colors">
              Change the avatar
            </button>
          </div>
        </div>
        </div>
        
    <div className="space-y-6 pt-8 border-t border-white/80">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-white/90 mb-2">First name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all mb-4"
          />
        </div>
        <div>
          <label className="block text-sm text-white/90 mb-2">Last name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all mb-4"
          />
        </div>
        <div>
          <label className="block text-sm text-white/90 mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all mb-4"
          />
        </div>
        <div>
          <label className="block text-sm text-white/90 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all mb-4"
          />
        </div>
      </div>

      <button className="w-40 px-2 py-2 bg-white text-black rounded-lg hover:bg-white/80 transition-colors text-sm font-Inter">
        Submit
      </button>

      <div className="flex flex-wrap justify-center gap-4 pt-8 border-t border-white/80">
        <button className="px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors flex items-center gap-4">
          <img
            src={googleImage}
            alt="Google"
            className="w-6 h-6"
          />
          Link with Google
        </button>
        <button className="px-12 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#1a1a1a]/90 transition-colors flex items-center gap-4">
          <img
            src={intraImage}
            alt="42"
            className="w-6 h-6"
          />
          Link with 42
        </button>
      </div>
    </div>
    </div>
  );
}