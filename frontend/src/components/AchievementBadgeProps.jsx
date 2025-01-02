// Achievements.jsx
import React from 'react';
import { AchievementCard } from './AchievementCard';

export const Achievements = () => {
  const achievements = [
    { title: 'First Victory', description: 'Win your first match', progress: 100 },
    { title: 'Perfect Game', description: 'Win a game 11-0', progress: 0 },
    { title: 'Winning Streak', description: 'Win 5 games in a row', progress: 80 },
    { title: 'Tournament Victor', description: 'Win a tournament', progress: 40 },
    { title: 'Global Elite', description: 'Reach top 100 ranking', progress: 60 },
    { title: 'Master Player', description: 'Play 1000 matches', progress: 20 }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {achievements.map((achievement, i) => (
        <AchievementCard key={i} {...achievement} />
      ))}
    </div>
  );
};