import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import Pve3d from './pve/Pve3d';
import Pvp2d from './pvp/Pvp2d';
import Pve2d from './pve/Pve2d';

function App() {
  const [username, setUsername] = useState<string>('');


  const handleUsernameSubmit = (username: string) => {
    sessionStorage.setItem('username', username);
    setUsername(username);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage onUsernameSubmit={handleUsernameSubmit} />} />
        <Route path="/pve3d" element={<Pve3d />} />
        <Route path="/pvp2d" element={<Pvp2d username= {username} />} />
        <Route path="/pve2d" element={<Pve2d />} />
      </Routes>
    </Router>
  );
}

export default App;