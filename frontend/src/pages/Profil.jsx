import React from 'react';
import MatchHistory from './UserProfil/Components/MatchHistory';
// import './Profile.css';

const Profil = () => {

  const getinfo = {}


  return (
    <div className="profile-page">
      <h1>Profile</h1>
    <MatchHistory username={eagoumi} />
    </div>
  );
};

export default Profil;