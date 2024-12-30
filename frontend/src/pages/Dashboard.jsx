import { React, useContext, useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from "../context_login_Register/AuthContext"
import NotificationDisplay from './NotificationDisplay'
import { WebSocketContext } from "../WebSocketProvider/WebSocketProvider";

export const Dashboard = () => {
  const navigate = useNavigate();

  const { logoutUsers } = useContext(AuthContext);
  const { wsManager } = useContext(WebSocketContext);
  const [matchHistory, setMatchHistory] = useState([]);

  // can fetch match history from `http://localhost:8000/api/match-history/{username}`

  useEffect(() => {
      const fetchMatchHistory = async () => {
          const response = await fetch(`http://localhost:8000/api/match-history/a`);
          const data = await response.json();
          setMatchHistory(data);
      }

      fetchMatchHistory();
  }
  , []);

  const sendMessage = () => {
    if (wsManager) {
      wsManager.sendMessage("Hello from Dashboard");
    }
  };

  console.log(matchHistory);

  const handleLogout = (e) => {
    e.preventDefault();
    console.log("hellllo");
    logoutUsers();
  }
    

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <NotificationDisplay />
      <h1>Dashboard</h1>
      <div className="navigation-buttons">
        <button onClick={() => navigate('/pve2d')}>PVE 2D</button>
        <button onClick={() => navigate('/pvp2d')}>PVP 2D</button>
        <button onClick={() => navigate('/pve3d')}>PVE 3D</button>
        <button onClick={() => navigate('/pvp3d')}>PVP 3D</button>
        <button onClick={() => navigate('/profile')}>Profile</button>
        <button onClick={() => navigate('/search')}>Search</button>
        <button onClick={() => navigate('/security')}>Security</button>
        <button onClick={() => navigate('/tournamentHome')}>Tournament</button>
      </div>
      <form onSubmit={handleLogout}>
        <div className='btn-register'>
          <button type='submit'>SIGN UP</button>
        </div>
      </form>
      <button onClick={sendMessage}>Send Message</button>
    </div>
  )
}

export default Dashboard