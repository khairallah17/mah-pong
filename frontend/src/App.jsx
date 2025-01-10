import ProtectRouter from "./providers/ProtectRouter"
import Authentication from "./pages/authentication.jsx";
import Dashboard from './pages/dashboard';
import React, { useState } from 'react';
import ProtectRouter from "./protection_axios/ProtectRouter"
import ProtectLogin from "./protection_axios/ProtectLogin.jsx"
import { AuthProvider } from "./context_login_Register/AuthContext.jsx"
import { Register, Login, VerifyPsdEmail, ResetPassword, Profil, Friends } from "./pages"
import FullDashboard from './pages/fulldashboard';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TwoFactorAuth from './pages/OTP_2fa/TwoFactorAuth.jsx'
import HomePage from './HomePage';
import SecurityPage from './pages/SecurityProfile.jsx';
import Pve3d from './pages/pve/Pve3d';
import Pvp2d from './pages/pvp/Pvp2d';
import Pve2d from './pages/pve/Pve2d';
import Pvp3d from './pages/pvp/Pvp3d';
import Profile from './pages/Profile.jsx'
import Tournament from './pages/tournament/Tournament'
import TournamentHome from './pages/tournament/tournamentHome';
import Chat from "./pages/chat.jsx";
import Game from "./pages/game.jsx";
import Settings from "./pages/settings.jsx";
import { ColorProvider } from "./context/ColorContext.jsx";

import VerifyPsdEmail from "./pages/VerifyPsdEmail.jsx";
import ResetPassowrd from "./pages/ResetPassword"

import { WebSocketProvider } from './WebSocketProvider/WebSocketProvider.jsx';
import NotificationDisplay from './pages/NotificationDisplay.jsx';
// import Friendrequest from './pages/Friendrequest.jsx';
import { MatchHistory, PictureUser, GameStats, Achievement } from "./pages/UserProfil/Components";
import Layout from './components/layout';

import Providers from './providers/providers.jsx';
import NotFound from "./pages/404.jsx";

function App() {


  return (
    <Router>
      <Providers>

        <Routes>

          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Authentication />} />
          <Route path="/reset-password" element={<VerifyPsdEmail />} />

          <Route element={<ProtectRouter />}>
            <Route element={<Layout />}>
              <Route path='/dashboard'>
                <Route index element={<Dashboard />} />
                <Route path="/match-history" element={<MatchHistory />} />
                <Route path="/achievement" element={<Achievement />} />
                <Route path="/game-stats" element={<GameStats />} />
                <Route path="/friends" element={<Friends />} />

                <Route path="chat" element={<Chat />} />

                <Route path="game">
                  <Route index element={<Game />} />
                  <Route path="pve3d" element={<Pve3d />} />
                  <Route path="pvp3d" element={<Pvp3d />} />
                  <Route path="pvp2d" element={<ColorProvider><Pvp2d /></ColorProvider>} />
                  <Route path="pve2d" element={<ColorProvider><Pve2d /></ColorProvider>} />
                </Route>

                {/* <Route path="profil/:username" element={<Profil />} /> */}

                <Route path='tournament'>
                  <Route index element={<TournamentHome />} />
                  <Route path='live' element={<Tournament />} />
                </Route>

                <Route path="security" element={<SecurityPage />} />
                <Route path="profile" element={<Profile />} />

              </Route>

              <Route path="/TwoFactorAuth" element={<TwoFactorAuth />} />


            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />

        </Routes>

      </Providers>
    </Router>
  );
}

export default App;