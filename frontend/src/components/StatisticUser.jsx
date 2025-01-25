import React, { useState, useEffect } from 'react';
import { Gamepad2, Trophy, Activity, BarChart2, XCircle } from 'lucide-react';
import { StatCard } from './StatisticCards';
import { WeeklyChart } from './WeklyChart';
import { useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import '../i18n';
import { useTranslation } from 'react-i18next';

export const Statistics = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState([
    { label: 'Total Games', value: '...', icon: <Gamepad2 size={20} />, color: 'from-blue-500 to-purple-500' },
    { label: 'Win Rate', value: '...', icon: <Trophy size={20} />, color: 'from-green-500 to-emerald-500' },
    { label: 'ELO Rating', value: '...', icon: <Activity size={20} />, color: 'from-yellow-500 to-orange-500' },
    { label: 'Wins', value: '...', icon: <BarChart2 size={20} />, color: 'from-pink-500 to-rose-500' },
    { label: 'Losses', value: '...', icon: <XCircle size={20} />, color: 'from-red-500 to-red-600' }
  ]);
  const [weeklyPerformance, setWeeklyPerformance] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  
  const params = useParams();
  const token = JSON.parse(localStorage.getItem('authtoken')).access;
  const currentUser = jwtDecode(token).username;
  const username = params.username || currentUser;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/game/api/player-stats/${username}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        const totalGames = data.wins + data.losses;
        const winRate = totalGames > 0 ? Math.round((data.wins / totalGames) * 100) : 0;
        const eloRating = data.elo ?? 0;
        const dataWins = data.wins ?? 0;
        const dataLosses = data.losses ?? 0;

        
        setStats([
          {
            label: t('Total Games'),
            value: totalGames.toString(),
            icon: <Gamepad2 size={20} />,
            color: 'from-blue-500 to-purple-500'
          },
          {
            label: t('Win Rate'),
            value: `${winRate}%`,
            icon: <Trophy size={20} />,
            color: 'from-green-500 to-emerald-500'
          },
          {
            label: t('ELO Rating'),
            value: eloRating.toString(),
            icon: <Activity size={20} />,
            color: 'from-yellow-500 to-orange-500'
          },
          {
            label: t('Wins'),
            value: dataWins.toString(),
            icon: <BarChart2 size={20} />,
            color: 'from-pink-500 to-rose-500'
          },
          {
            label: t('Losses'),
            value: dataLosses.toString(),
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
  }, [username, token]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>
      <WeeklyChart user={username} percentages={weeklyPerformance} loading={loading} />
    </div>
  );
};