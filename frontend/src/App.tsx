import { useEffect, useState } from 'react'
import axios from 'axios'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Game2 from './Game2';

function HomePage() {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={() => navigate('/game')}>
          Go to game
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

function BackendComponent() {
  useEffect(() => {
    axios.get('http://localhost:8000/my_endpoint/')
      .then((response: any) => {
        console.log(response.data)
      })
  }, [])
  return (
    <div>
      <h1>Backend component</h1>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/game" element={<Game2 />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/backend" element={<BackendComponent />} />
      </Routes>
    </Router>
  )
}



export default App
