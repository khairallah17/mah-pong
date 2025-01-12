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

// Register ChartJS components
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

export const WeeklyChart = (user) => {
  const [matchData, setMatchData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  // const token = JSON.parse(localStorage.getItem('authtoken')).access;
  const username = user.user


  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        // const username = 'z';
        console.log("username is", username)
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
    const dailyCounts = new Array(7).fill(0);
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    matchData.forEach(match => {
      const matchDate = new Date(match.datetime);
      if (matchDate >= startOfWeek) {
        const dayIndex = matchDate.getDay();
        dailyCounts[dayIndex]++;
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

  return (
    <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
      <h3 className="text-lg font-bold mb-4">Weekly Match Activity</h3>
      <div className="h-64 w-full">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default WeeklyChart;