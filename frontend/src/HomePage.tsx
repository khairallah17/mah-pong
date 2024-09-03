import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import aub from './assets/aub.jpeg';

interface HomePageProps {
  onUsernameSubmit: (username: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onUsernameSubmit }) => {
  const [username, setUsername] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    onUsernameSubmit(username);
    setIsSubmitted(true);
  };

  return (
    <div className="homepage">
      <header>
        <nav className='navbar'>
          <img className='logo' src='Logo' alt='Logo'/>
          <button>About</button>
          <button>Team</button>
          <button>Contact Us</button>
          <button style={{backgroundColor: "black"}}>Play now</button>
        </nav>
      </header>
      {!isSubmitted ? (
        <div className="username-input">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleSubmit}>Submit</button>
        </div>
      ) : (
        <div className="navigation-buttons">
          <button onClick={() => navigate('/pve2d')}>PVE 2D</button>
          <button onClick={() => navigate('/pvp2d')}>PVP 2D</button>
          <button onClick={() => navigate('/pve3d')}>PVE 3D</button>
        </div>
      )}
      <div className='team-container'>
        <h1 style={{position: 'absolute', top: "-35vh"}}>Meet the team</h1>
        <div className="team-member">
          <img src={aub} alt='pfp'/>
          <h2>Name</h2>
          <p>position @ School</p>
          <p>“This section is about the team member, what he know, and what part he work in this project.”</p>
        </div>
        <div className="team-member">
          <img src={aub} alt='pfp'/>
          <h2>Name</h2>
          <p>position @ School</p>
          <p>“This section is about the team member, what he know, and what part he work in this project.”</p>
        </div>
        <div className="team-member">
          <img src={aub} alt='pfp'/>
          <h2>Name</h2>
          <p>position @ School</p>
          <p>“This section is about the team member, what he know, and what part he work in this project.”</p>
        </div>
        <div className="team-member">
          <img src={aub} alt='pfp'/>
          <h2>Name</h2>
          <p>position @ School</p>
          <p>“This section is about the team member, what he know, and what part he work in this project.”</p>
        </div>
        <div className="team-member">
          <img src={aub} alt='pfp'/>
          <h2>Name</h2>
          <p>position @ School</p>
          <p>“This section is about the team member, what he know, and what part he work in this project.”</p>
        </div>
      </div>
      <div className='space'>
      </div>
    </div>
  );
};

export default HomePage;