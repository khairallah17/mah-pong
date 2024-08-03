import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Pve3d from './pve/Pve3d';
import Pve2d from './pve/Pve2d';

function HomePage() {
  const navigate = useNavigate()

  return (
    <>
      <div className="card">
        <button onClick={() => navigate('/pve2d')}>
          pve 2D
        </button>
        <button onClick={() => navigate('/pve3d')}>
          pve 3D
        </button>
      </div>
    </>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/pve3d" element={<Pve3d />} />
        <Route path="/pve2d" element={<Pve2d />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  )
}


export default App
