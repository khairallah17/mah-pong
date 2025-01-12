import React, { useState, useEffect } from 'react';
import { Gamepad2, Trophy, Activity, BarChart2, XCircle } from 'lucide-react';
import { StatCard } from './StatisticCards';
import { WeeklyChart } from './WeklyChart';  // Make sure the path and filename match exactly

export const Statistics = () => {
  const [stats, setStats] = useState([
    { label: 'Total Games', value: '...', icon: <Gamepad2 size={20} />, color: 'from-blue-500 to-purple-500' },
    { label: 'Win Rate', value: '...', icon: <Trophy size={20} />, color: 'from-green-500 to-emerald-500' },
    { label: 'ELO Rating', value: '...', icon: <Activity size={20} />, color: 'from-yellow-500 to-orange-500' },
    { label: 'Wins', value: '...', icon: <BarChart2 size={20} />, color: 'from-pink-500 to-rose-500' },
    { label: 'Losses', value: '...', icon: <XCircle size={20} />, color: 'from-red-500 to-red-600' }
  ]);
  const [weeklyPerformance, setWeeklyPerformance] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const username = 'a'; // Replace with actual username
        const response = await fetch(`http://localhost:8000/api/player-stats/${username}/`);
        const data = await response.json();

        const totalGames = data.wins + data.losses;
        const winRate = totalGames > 0 ? Math.round((data.wins / totalGames) * 100) : 0;

        setStats([
          {
            label: 'Total Games',
            value: totalGames.toString(),
            icon: <Gamepad2 size={20} />,
            color: 'from-blue-500 to-purple-500'
          },
          {
            label: 'Win Rate',
            value: `${winRate}%`,
            icon: <Trophy size={20} />,
            color: 'from-green-500 to-emerald-500'
          },
          {
            label: 'ELO Rating',
            value: data.elo.toString(),
            icon: <Activity size={20} />,
            color: 'from-yellow-500 to-orange-500'
          },
          {
            label: 'Wins',
            value: data.wins.toString(),
            icon: <BarChart2 size={20} />,
            color: 'from-pink-500 to-rose-500'
          },
          {
            label: 'Losses',
            value: data.losses.toString(),
            icon: <XCircle size={20} />,
            color: 'from-red-500 to-red-600'
          }
        ]);

        const todayPerformance = winRate;
        const weeklyStats = [0, 0, 0, 0, 0, 0, todayPerformance];
        setWeeklyPerformance(weeklyStats);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>
      <WeeklyChart percentages={weeklyPerformance} loading={loading} />
    </div>
  );
};