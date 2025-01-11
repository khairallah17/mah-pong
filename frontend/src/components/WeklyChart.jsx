import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const WeeklyChart = () => {
  const [matchData, setMatchData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const username = 'zouhairlrs';
        const response = await fetch(`http://localhost:8000/api/match-history/${username}/`);
        if (!response.ok) throw new Error('Failed to fetch match data');
        const data = await response.json();
        setMatchData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMatchData();
    const interval = setInterval(fetchMatchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const processDataForChart = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyData = days.map(day => ({ name: day, matches: 0 }));
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    matchData.forEach(match => {
      const matchDate = new Date(match.datetime);
      if (matchDate >= startOfWeek) {
        const dayIndex = matchDate.getDay();
        dailyData[dayIndex].matches++;
      }
    });

    return dailyData;
  };

  if (loading) {
    return (
      <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
        <div className="text-center text-red-400">Error: {error}</div>
      </div>
    );
  }

  const chartData = processDataForChart();

  return (
    <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
      <h3 className="text-lg font-bold mb-4">Weekly Match Activity</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.375rem'
              }}
              labelStyle={{ color: '#9CA3AF' }}
              itemStyle={{ color: '#E5E7EB' }}
            />
            <Line 
              type="monotone" 
              dataKey="matches" 
              stroke="url(#colorGradient)" 
              strokeWidth={2}
              dot={{ 
                fill: '#8B5CF6',
                stroke: '#6D28D9',
                strokeWidth: 2,
                r: 4
              }}
              activeDot={{ 
                fill: '#A78BFA',
                stroke: '#7C3AED',
                strokeWidth: 2,
                r: 6
              }}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyChart;