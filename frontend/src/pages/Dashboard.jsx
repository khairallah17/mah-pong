import { React, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from "../context_login_Register/AuthContext"


export const Dashboard = () => {
  const navigate = useNavigate();

  const {logoutUsers} = useContext(AuthContext);

  const handleLogout = (e) => {
    e.preventDefault();
    console.log("hellllo");
    logoutUsers();
  }

  return (
    <div style={{display:'flex', alignItems: 'center', justifyContent: 'center'}}>
      <h1>Dashboard</h1>
      <div className="navigation-buttons">
        <button onClick={() => navigate('/pve2d')}>PVE 2D</button>
        <button onClick={() => navigate('/pvp2d')}>PVP 2D</button>
        <button onClick={() => navigate('/pve3d')}>PVE 3D</button>
        <button onClick={() => navigate('/pvp3d')}>PVP 3D</button>
      </div>
      <form onSubmit={handleLogout}>
        <div className='btn-register'>
            <button  type='submit'>SIGN UP</button>
        </div>
      </form>
    </div>
  )
}

export default Dashboard