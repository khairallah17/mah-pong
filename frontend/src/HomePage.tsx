import React, { useReducer, useRef, useState } from 'react';
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
  const headlineRef = useRef(null);
  const teamRef = useRef(null);
  const contactUsRef = useRef(null);
  const aboutRef = useRef(null);

  const scrollToRef = (ref: any) => {
    window.scrollTo({
      top: ref.current.offsetTop - window.innerHeight / 2,
      behavior: 'smooth'
    });
  }

  const handleSubmit = () => {
    onUsernameSubmit(username);
    setIsSubmitted(true);
  };

  return (
    <div className="homepage">
      <header>
        <nav className='navbar'>
          <img className='logo' src='Logo' alt='Logo'/>
          <button onClick={() => {scrollToRef(aboutRef)}}>About</button>
          <button onClick={() => {scrollToRef(teamRef)}}>Team</button>
          <button onClick={() => {scrollToRef(contactUsRef)}}>Contact Us</button>
          <button onClick={() => {scrollToRef(headlineRef)}} style={{backgroundColor: "black"}}>Play now</button>
        </nav>
      </header>
      <img src='https://shorturl.at/qo5Up' alt="table" style={{marginTop: "15vh"}}></img>
      <div className='headline' ref={headlineRef}>
        <div style={{paddingRight: "20%"}}>
          <h1>“Title - Headline”</h1>
          <p>“This section is about the game, what is it, what is the goal, and how to play it.”</p>
          <button>Play now</button>
        </div>
        <img src='https://shorturl.at/bcvdo' alt='Game'/>
      </div>
      <div className='team-container' ref={teamRef}>
        <h1 style={{position: 'absolute', top: "-35vh"}}>Meet the team</h1>
        <div className="team-member">
          <img src={aub} alt='pfp'/>
          <h2>Name</h2>
          <p>position @ School</p>
          <p>“This section is about the team member, what he knows, and the part on which he worked on.”</p>
        </div>
        <div className="team-member">
          <img src={aub} alt='pfp'/>
          <h2>Name</h2>
          <p>position @ School</p>
          <p>“This section is about the team member, what he knows, and the part on which he worked on.”</p>
        </div>
        <div className="team-member">
          <img src={aub} alt='pfp'/>
          <h2>Name</h2>
          <p>position @ School</p>
          <p>“This section is about the team member, what he knows, and the part on which he worked on.”</p>
        </div>
        <div className="team-member">
          <img src={aub} alt='pfp'/>
          <h2>Name</h2>
          <p>position @ School</p>
          <p>“This section is about the team member, what he knows, and the part on which he worked on.”</p>
        </div>
        <div className="team-member">
          <img src={aub} alt='pfp'/>
          <h2>Name</h2>
          <p>position @ School</p>
          <p>“This section is about the team member, what he knows, and the part on which he worked on.”</p>
        </div>
      </div>
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
      <div className='space'>
      </div>
    </div>
  );
};

export default HomePage;