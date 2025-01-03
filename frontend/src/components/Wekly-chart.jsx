// WeeklyChart.jsx
import React from 'react';

export const WeeklyChart = () => (
  <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
    <h3 className="text-lg font-bold mb-4">Weekly Performance</h3>
    <div className="h-40 flex items-end justify-between gap-2">
      {[65, 80, 45, 90, 75, 85, 70].map((height, i) => (
        <div key={i} className="w-full relative group">
          <div 
            className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all duration-300 hover:from-blue-400 hover:to-purple-400"
            style={{ height: `${height}%` }}
          />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            {height}%
          </div>
        </div>
      ))}
    </div>
    <div className="flex justify-between mt-2 text-xs text-gray-400">
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
        <span key={day}>{day}</span>
      ))}
    </div>
  </div>
);