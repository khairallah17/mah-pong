// MatchHistory.jsx
import React from 'react';
import { Activity } from 'lucide-react';

export const MatchHistory = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Activity size={20} />
          </div>
          <div>
            <div className="font-medium">Match #{1000 + i}</div>
            <div className="text-sm text-gray-400">vs Player {i + 1}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-medium text-green-400">11 - 9</div>
          <div className="text-sm text-gray-400">+25 Rating</div>
        </div>
      </div>
    ))}
  </div>
);
