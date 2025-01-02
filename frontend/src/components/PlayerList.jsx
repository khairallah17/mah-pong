import React from 'react';
import { Users, Search, Gamepad2, MessageCircle } from 'lucide-react';

const avatars = [
  "/api/placeholder/100/100",
  "/api/placeholder/100/100",
  "/api/placeholder/100/100",
  "/api/placeholder/100/100",
  "/api/placeholder/100/100"
];

export const PlayerList = () => (
  <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 rounded-xl border border-blue-500/20">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Users className="text-blue-400" />
        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">Online Players</h2>
      </div>
      <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">24/100</span>
    </div>
    <div className="relative mb-4">
      <Search className="absolute left-3 top-2.5 text-blue-400/50" size={18} />
      <input
        type="text"
        placeholder="Search players..."
        className="w-full bg-black/40 border border-blue-500/20 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all"
      />
    </div>
    <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar">
      {avatars.map((avatar, i) => (
        <div key={i} className="flex items-center justify-between p-3 hover:bg-blue-500/5 rounded-lg transition-all border border-transparent hover:border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 p-0.5">
              <img 
                src="https://github.com/shadcn.png" 
                alt="Player Avatar"
                className="w-full h-full object-cover rounded-[5px]"
              />
            </div>
            <div>
              <div className="font-medium text-blue-50">Player {i + 1}</div>
              <div className="text-xs text-blue-300/60">Rating: {1200 + i * 100}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-blue-400/10 rounded-lg transition-all border border-transparent hover:border-blue-400/20 group">
              <Gamepad2 size={18} className="text-blue-400 group-hover:text-blue-300" />
            </button>
            <button className="p-2 hover:bg-blue-400/10 rounded-lg transition-all border border-transparent hover:border-blue-400/20 group">
              <MessageCircle size={18} className="text-blue-400 group-hover:text-blue-300" />
            </button>
            <div className="h-2 w-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);