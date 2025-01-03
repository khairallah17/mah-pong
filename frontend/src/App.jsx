import ProtectRouter from "./providers/ProtectRouter"
import Authentication from "./pages/authentication.jsx";
import Dashboard from './pages/dashboard';
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

import Layout from './components/layout';

import Providers from './providers/providers.jsx';
// import ColorProvider from './context/ColorContext';
import NotFound from "./pages/404.jsx";

function App() {


  return (
    <Router>
      <Providers>

            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Authentication />} />

              <Route element={<ProtectRouter />}>
                <Route element={<Layout/>}>
                  <Route path='/dashboard'>
                    <Route index element={<Dashboard />} />
                    
                    <Route path="chat" element={<Chat />} />

                    <Route path="game">
                      <Route index element={<Game />} />
                      <Route path="pve3d" element={<Pve3d />} />
                      <Route path="pvp3d" element={<Pvp3d />} />
                      <Route path="pvp2d" element={<Pvp2d />} />
                      <Route path="pve2d" element={<Pve2d />} />
                    </Route>
                    
                    {/* <Route path="profil/:username" element={<Profil />} /> */}
                    
                    <Route path='tournament'>
                      <Route index element={<TournamentHome/>}/>
                      <Route path='live' element={<Tournament/>}/>
                    </Route>

                    <Route path="security" element={<SecurityPage />} />
                    <Route path="profile" element={<Profile />} />

                  </Route>
                  
                  <Route path="/TwoFactorAuth" element={<TwoFactorAuth />} />
                  
                  
                </Route>
              </Route>

              <Route path="*" element={<NotFound/>} />
              
            </Routes>

        </Providers>
    </Router>
  );
}

export default App;