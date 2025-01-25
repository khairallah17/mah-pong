import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const WeeklyChart = ({ user }) => {
  const [matchData, setMatchData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  // Validate username
  console.log("user", user);
  const username = user?.trim() || '';
  console.log("username", username);

  useEffect(() => {
    const fetchMatchData = async () => {
      // Return early if no username
      if (!username) {
        setError('No username provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/game/api/match-history/${username}/`);
        const data = await response.json();

        // Handle the specific "No matches" error case
        if (data.error === 'No matches found for this player') {
          setMatchData([]);
          setError(null);
          setLoading(false);
          return;
        }

        // Handle other error cases
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch match data');
        }
        
        // Validate received data
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }
        
        setMatchData(data);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching match data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMatchData();
    const interval = setInterval(fetchMatchData, 5000);
    return () => clearInterval(interval);
  }, [username]);

  const processDataForChart = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyCounts = new Array(7).fill(0);
    
    // Check if matchData exists and is not empty
    if (!matchData || matchData.length === 0) {
      return { labels: days, data: dailyCounts };
    }

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    matchData.forEach(match => {
      try {
        // Validate match date
        const matchDate = new Date(match?.datetime);
        if (matchDate && !isNaN(matchDate) && matchDate >= startOfWeek) {
          const dayIndex = matchDate.getDay();
          dailyCounts[dayIndex]++;
        }
      } catch (error) {
        console.error('Error processing match date:', error);
      }
    });

    return { labels: days, data: dailyCounts };
  };

  const { labels, data } = processDataForChart();

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Matches Played',
        data: data,
        fill: true,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#6D28D9',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#A78BFA',
        pointHoverBorderColor: '#7C3AED',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#9CA3AF',
        bodyColor: '#E5E7EB',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} matches`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#374151',
          tickLength: 0
        },
        ticks: {
          color: '#9CA3AF'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#9CA3AF',
          stepSize: 1
        }
      }
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-center text-gray-400">Loading...</div>;
    }

    if (error) {
      return <div className="text-center text-red-400">Error: {error}</div>;
    }

    if (!matchData || matchData.length === 0) {
      return (
        <>
          <h3 className="text-lg font-bold mb-4">Weekly Match Activity</h3>
          <div className="text-center text-gray-400 py-8">
            No matches played this week
          </div>
        </>
      );
    }

    return (
      <>
        <h3 className="text-lg font-bold mb-4">Weekly Match Activity</h3>
        <div className="h-64 w-full">
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      </>
    );
  };

  return (
    <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
      {renderContent()}
    </div>
  );
};

export default WeeklyChart;