import React from 'react'
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="navigation-buttons">
        <button onClick={() => navigate('/pve2d')}>PVE 2D</button>
        <button onClick={() => navigate('/pvp2d')}>PVP 2D</button>
        <button onClick={() => navigate('/pve3d')}>PVE 3D</button>
        <button onClick={() => navigate('/pvp3d')}>PVP 3D</button>
      </div>
    </div>
  )
}

export default Dashboard