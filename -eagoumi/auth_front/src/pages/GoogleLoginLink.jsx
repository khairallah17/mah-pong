import React from 'react';
import { Link } from 'react-router-dom';
import google_logo from '../images/google_logo.png'

const GoogleLoginLink = () => {
  const googleLoginUrl = 'http://localhost:8001/accounts/google/login'|| 'http://127.0.0.1:8000/accounts/google/login';


  const linkContent = (
    
    <>
      {/* Unicode character for a simple "G" icon */}
      <span style={{ fontWeight: 'bold', marginRight: '5px' }}><img src={google_logo} alt="Google" /></span>
      Login with Google
    </>
  );
  return (
    <Link 
      to={googleLoginUrl} 
      className="btn btn-danger mt-2"
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {linkContent}
    </Link>
  );
};

export default GoogleLoginLink;