import React, { useState } from 'react';
import ProtectRouter from "./protection_axios/ProtectRouter"
import ProtectLogin from "./protection_axios/ProtectLogin.jsx"
import { AuthProvider } from "./context_login_Register/AuthContext.jsx"
import { Register, Login, Dashboard, VerifyPsdEmail, ResetPassword} from "./pages"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { useNavigate } from "react-router-dom";
import TwoFactorAuth from './pages/OTP_2fa/TwoFactorAuth.jsx'
import HomePage from './HomePage';
import SecurityPage from './pages/SecurityProfile.jsx';
import FriendFinder from './pages/SearchPage.jsx';
import Pve3d from './pve/Pve3d';
import Pvp2d from './pvp/Pvp2d';
import Pve2d from './pve/Pve2d';
import Pvp3d from './pvp/Pvp3d';
import Profile from './pages/Profile.jsx'
import SecurityProfile from './pages/SecurityProfile'
import SearchPage from './pages/SearchPage'
import Tournament from './pages/tournament/Tournament'
import TournamentHome from './pages/tournament/tournamentHome';
import { WebSocketProvider } from './WebSocketProvider/WebSocketProvider.jsx';
import NotificationDisplay from './pages/NotificationDisplay.jsx';
import MatchHistory from './pages/UserProfil/Components/MatchHistory.jsx';

function App() {


  return (
    // <div className='sidebar'>
    <Router>
      <AuthProvider>
        <WebSocketProvider>
          <div className="navbar">
            <NotificationDisplay />
          </div>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* ProtectLogin componnent Private if are already logged in */}
            <Route path="/login" element={
              // <ProtectLogin>
              <Login />
              // </ProtectLogin>
            } />
            <Route path="/register" element={
              // <ProtectLogin>
              <Register />
              // </ProtectLogin>
            } />
            <Route path="/match-history" element={
              // <ProtectLogin>
              <MatchHistory />
              // </ProtectLogin>
            } />
            <Route path="/password-reset" element={
              <VerifyPsdEmail />
            } />

          <Route path="/password-reset/confirm" element={
            <ResetPassword />
          } />


          {/* ProtectRouter component Private if are not logged in */}
          <Route element={<ProtectRouter />}>
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pve3d" element={<Pve3d />} />
            <Route path="/pvp3d" element={<Pvp3d />} />
            <Route path="/pvp2d" element={<Pvp2d />} />
            <Route path="/pve2d" element={<Pve2d />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/securityProfile" element={<SecurityProfile />} />
            {/* <Route path="/search" element={<SearchPage />} /> */}
            <Route path='/tournament' element={<Tournament/>}/>
            <Route path='/tournamentHome' element={<TournamentHome/>}/>
            <Route path="/TwoFactorAuth" element={
                <TwoFactorAuth />
            } />
            
            
          </Route>

            {/* Catch all other routes */}
            {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
            {/* we should to replace / to /404-error page (Error 404 Page )*/}
          </Routes>
        </WebSocketProvider>
      </AuthProvider>
    </Router>
    // </div>
  );
}

export default App;