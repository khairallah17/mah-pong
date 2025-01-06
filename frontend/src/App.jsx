import React, { useState } from 'react';
import ProtectRouter from "./protection_axios/ProtectRouter"
import ProtectLogin from "./protection_axios/ProtectLogin.jsx"
import { AuthProvider } from "./context_login_Register/AuthContext.jsx"
import { Register, Login, VerifyPsdEmail, ResetPassword, Profil, Friends} from "./pages"
import FullDashboard from './pages/fulldashboard';
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
// import Friendrequest from './pages/Friendrequest.jsx';
import { MatchHistory, PictureUser, GameStats, Achievement } from "./pages/UserProfil/Components";
import Layout from './components/layout';

import Providers from './providers/providers.jsx';

function App() {


  return (
    // <div className='sidebar'>
    <Router>
      <Providers>
        <AuthProvider>
          <WebSocketProvider>
              <NotificationDisplay />
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

              <Route path="/achievement" element={
                // <ProtectLogin>
                <Achievement />
                // </ProtectLogin>
              } />


              <Route path="/game-stats" element={
                // <ProtectLogin>
                <GameStats />
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
              <Route element={<Layout/>}>
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/search" element={<SearchPage />} />
                {/* <Route path="/dashboard" element={<FullDashboard />} /> */}
                <Route path='/dashboard' element={<FullDashboard />} />
                <Route path="/pve3d" element={<Pve3d />} />
                <Route path="/pvp3d" element={<Pvp3d />} />
                <Route path="/pvp2d" element={<Pvp2d />} />
                <Route path="/pve2d" element={<Pve2d />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profil/:username" element={
                  // <ProtectLogin>
                  <Profil />
                  // </ProtectLogin>
                } />
                <Route path="/securityProfile" element={<SecurityProfile />} />
                {/* <Route path="/search" element={<SearchPage />} /> */}
                <Route path='/tournament' element={<Tournament/>}/>
                <Route path='/tournamentHome' element={<TournamentHome/>}/>
                <Route path="/TwoFactorAuth" element={
                    <TwoFactorAuth />
                } />
                
                
              </Route>
              </Route>

              {/* Catch all other routes */}
              {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
              {/* we should to replace / to /404-error page (Error 404 Page )*/}
            </Routes>
          </WebSocketProvider>
        </AuthProvider>
        </Providers>
    </Router>
    // </div>
  );
}

export default App;