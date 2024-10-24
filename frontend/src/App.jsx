import React, { useState, useEffect } from 'react';
import ProtectRouter from "./protection_axios/ProtectRouter"
import { AuthProvider } from "./context_login_Register/AuthContext.jsx"
import { Profile, Register, Login, Dashboard } from "./pages"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import Pve3d from './pve/Pve3d';
import Pvp2d from './pvp/Pvp2d';
import Pve2d from './pve/Pve2d';
import Pvp3d from './pvp/Pvp3d';

function App() {
  const [username, setUsername] = useState('');


  const handleUsernameSubmit = (username) => {
    sessionStorage.setItem('username', username);
    setUsername(username);
  };

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage onUsernameSubmit={handleUsernameSubmit} />} />
          <Route path="/pve3d" element={<Pve3d />} />
          <Route path="/pvp3d" element={<Pvp3d />} />
          <Route path="/pvp2d" element={<Pvp2d />} />
          <Route path="/pve2d" element={<Pve2d />} />
          <Route path='/profile' element={
            <ProtectRouter> 
              <Profile />
            </ProtectRouter>
          }/>
          <Route path='/dashboard' element={
            <ProtectRouter>
              <Dashboard />
            </ProtectRouter>
          }/>
          <Route path='/login' element={<Login />}/>
          <Route path='/register' element={<Register />}/>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;