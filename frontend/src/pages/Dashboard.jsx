import React from 'react'

const Dashboard = () => {
  return (
    <div>
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