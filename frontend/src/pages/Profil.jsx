import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Profil = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const { username } = useParams();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8001/api/user-profile/${username}/`);
        if (!response.ok) {
          throw new Error('Profile not found');
        }
        const data = await response.json();
        setProfile(data);
        console.log(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProfile();
  }, [username]);

  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h1>{profile.fullname}</h1>
      <img src={profile.avatar} alt="Profile avatar" />
      <p>Username: {profile.username}</p>
      <p>Email: {profile.email}</p>
      <p>Score: {profile.score}</p>
      <p>Wins: {profile.nbwin}</p>
      <p>Losses: {profile.nblose}</p>
      <p>Verified: {profile.profil.is_verified ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default Profil;