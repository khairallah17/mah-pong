// Statistics.jsx
import React from 'react';
import { Gamepad2, Trophy, Activity, BarChart2 } from 'lucide-react';
import { StatCard } from './StatisticCards';
import { WeeklyChart } from './Wekly-chart';

export const Statistics = () => {
  const stats = [
    { label: 'Total Games', value: '156', icon: <Gamepad2 size={20} />, color: 'from-blue-500 to-purple-500' },
    { label: 'Win Rate', value: '68%', icon: <Trophy size={20} />, color: 'from-green-500 to-emerald-500' },
    { label: 'Average Score', value: '11-7', icon: <Activity size={20} />, color: 'from-yellow-500 to-orange-500' },
    { label: 'Current Streak', value: '5', icon: <BarChart2 size={20} />, color: 'from-pink-500 to-rose-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>
      <WeeklyChart />
    </div>
  );
};