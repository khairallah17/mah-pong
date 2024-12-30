import React, { useContext, useState, useEffect } from 'react';
import AuthContext from "../context_login_Register/AuthContext"


const UserProfile = ({ userId }) => {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authTokens } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const url = userId 
          ? `http://localhost:8001/api/user/stats/${userId}/`
          : 'http://localhost:8001/api/user/stats/';
          
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${authTokens?.access}`,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user stats');
        }

        const data = await response.json();
        setUserStats(data);
      } catch (err) {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Invalid credentials or 2FA code",
          showConfirmButton: true,
          timerProgressBar: true,
          timer: 3000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [userId, authTokens]);

  if (loading) {
    return <div className="">Loading...</div>;
  }

  if (error) {
    return <div className="">Error: {error}</div>;
  }

  if (!userStats) {
    return <div className="">No user data available</div>;
  }

  return (
    <div className="">
      <div className="">
        <div className="">
          <img 
            src={userStats.avatar} 
            alt={`${userStats.username}'s avatar`}
          />
        </div>
        <div className="">
          <p className="">{userStats.fullname}</p>
          <h2 className="">{userStats.username}</h2>
        </div>
      </div>
      
      <div className="user-profile__stats">
        <div className="stat-card">
          <span className="stat-label">Wins</span>
          <span className="stat-value">{userStats.stats.wins}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Losses</span>
          <span className="stat-value">{userStats.stats.losses}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Win Rate</span>
          <span className="stat-value">{userStats.stats.win_rate}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Games</span>
          <span className="stat-value">{userStats.stats.total_games}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;