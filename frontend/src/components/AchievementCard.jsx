// AchievementCard.jsx
import React from 'react';
import { Award } from 'lucide-react';

export const AchievementCard = ({ title, description, progress }) => (
  <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
    <div className="flex items-center gap-2 mb-2">
      <Award className={progress === 100 ? 'text-yellow-400' : 'text-gray-500'} />
      <h3 className="font-medium">{title}</h3>
    </div>
    <p className="text-sm text-gray-400 mb-2">{description}</p>
    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);