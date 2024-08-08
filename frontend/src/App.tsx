import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import Pve3d from './pve/Pve3d';
import Pvp2d from './pvp/Pvp2d';
import Pve2d from './pve/Pve2d';

function App() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    if (username) {
      const ws = new WebSocket('ws://localhost:8000/ws/matchmaking/');
      ws.onopen = () => {
        console.log('WebSocket connection established');
        ws.send(JSON.stringify({ type: 'set_username', username }));
        console.log('Username sent:', username);
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
      };
      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
      setWs(ws);

      // Cleanup function to close WebSocket connection when App component unmounts
      return () => {
        ws.close();
      };
    }
  }, [username]);

  const handleUsernameSubmit = (username: string) => {
    sessionStorage.setItem('username', username);
    setUsername(username);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage onUsernameSubmit={handleUsernameSubmit} />} />
        <Route path="/pve3d" element={<Pve3d />} />
        <Route path="/pvp2d" element={<Pvp2d ws={ws} />} />
        <Route path="/pve2d" element={<Pve2d />} />
      </Routes>
    </Router>
  );
}

export default App;