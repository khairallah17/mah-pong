// StatCard.jsx
import React from 'react';

export const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
    <div className="flex items-center gap-2 mb-2">
      <div className={`bg-gradient-to-r ${color} rounded-full p-2 text-white`}>
        {icon}
      </div>
    </div>
    <div className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
      {value}
    </div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
);