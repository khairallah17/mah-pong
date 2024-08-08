import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    </div>
  );
};

export default HomePage;