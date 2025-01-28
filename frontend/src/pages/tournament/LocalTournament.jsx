import { React, useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../i18n';
import { useTranslation } from 'react-i18next';

export default function LocalTournament() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [players, setPlayers] = useState({ player1: '', player2: '', player3: '', player4: '' });
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [tournamentStarted, setTournamentStarted] = useState(false);
  const [champion, setChampion] = useState('');
  const [showMatchStartPopup, setShowMatchStartPopup] = useState(false);
  const [matchStartData, setMatchStartData] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const winner = queryParams.get('winner');
    const matchId = queryParams.get('match_id');
    const storedPlayers = JSON.parse(localStorage.getItem('players'));
    const storedMatches = JSON.parse(localStorage.getItem('matches'));
    const storedTournamentStarted = JSON.parse(localStorage.getItem('tournamentStarted'));


    if (storedPlayers) setPlayers(storedPlayers);
    if (storedMatches) setMatches(storedMatches);
    if (storedTournamentStarted) setTournamentStarted(storedTournamentStarted);

    if (winner && matchId) {
      handleMatchWinner(winner, parseInt(matchId));
    }
  }, [location.search]);

  useEffect(() => {
    const storedTournamentStarted = JSON.parse(localStorage.getItem('tournamentStarted'));
    if (storedTournamentStarted) {
      setTournamentStarted(storedTournamentStarted);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlayers({ ...players, [name]: value });
  };

  const startTournament = () => {

    const initialMatches = [
      { id: 1, round: 1, position: 1, player1: players.player1, player2: players.player2 },
      { id: 2, round: 1, position: 2, player1: players.player3, player2: players.player4 },
      { id: 3, round: 2, position: 1 }
    ];
    setMatches(initialMatches);
    setTournamentStarted(true);
    localStorage.setItem('players', JSON.stringify(players));
    localStorage.setItem('matches', JSON.stringify(initialMatches));
    localStorage.setItem('tournamentStarted', JSON.stringify(true));

  };

  const navigateToMatch = (matchIndex) => {
    setShowMatchStartPopup(true);
    setTimeout(() => {
      setShowMatchStartPopup(false);
      const match = matches[matchIndex];
      if (match) {
        navigate(`/dashboard/game/local2d?match_id=${match.id}&player1=${match.player1}&player2=${match.player2}`);
      }
    }, 3000);
  };

  const handleMatchWinner = (winner, matchId) => {
    setMatches(prevMatches => {
      const updatedMatches = [...prevMatches];
      const matchIndex = updatedMatches.findIndex(match => match.id === matchId);
      if (matchIndex !== -1) {
        updatedMatches[matchIndex].winner = winner;

        if (matchIndex === 0) {
          updatedMatches[2].player1 = winner;
        } else if (matchIndex === 1) {
          updatedMatches[2].player2 = winner;
        }

        if (matchIndex < 2) {
          setCurrentMatch(matchIndex + 1);
        } else {
          setChampion(winner);
          resetTournament();
        }
      }
      localStorage.setItem('matches', JSON.stringify(updatedMatches));
      return updatedMatches;
    });
    setTournamentStarted(true);
  };

  const resetTournament = () => {
    setPlayers({ player1: '', player2: '', player3: '', player4: '' });
    setMatches([]);
    setCurrentMatch(0);
    setTournamentStarted(false);
    localStorage.removeItem('players');
    localStorage.removeItem('matches');
    localStorage.removeItem('tournamentStarted');
  };

  const startNextMatch = () => {
    let nextIndex = currentMatch;
    while (nextIndex < matches.length && matches[nextIndex].winner) {
      nextIndex++;
    }
    if (nextIndex >= matches.length) return;

    const match = matches[nextIndex];
    setMatchStartData({ yourName: match.player1, opponent: match.player2 });
    setShowMatchStartPopup(true);

    setTimeout(() => {
      setShowMatchStartPopup(false);
      navigateToMatch(nextIndex);
      setCurrentMatch(nextIndex);
    }, 3000);
  };

  const handleQuit = () => {
    resetTournament();
    navigate('/dashboard');
  };

  return (
    <div className="w-full h-full justify-between flex flex-col p-8 pt-24">
      <div className="mx-auto w-full">
        {!tournamentStarted ? (
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold tracking-wider zen-dots" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              {t('LOCAL TOURNAMENT')}
            </h1>
            <div className="w-48 h-1 mx-auto mt-2"></div>
            <div className="mt-8 space-y-4">
              {[t('player') + '1', t('player') + '2', t('player') + '3', t('player') + '4'].map((player, index) => (
                <div key={index} className="flex items-center justify-center bg-transparent space-x-2">
                  <input
                    type="text"
                    name={player}
                    value={players[player]}
                    onChange={handleInputChange}
                    placeholder={`${t('Enter alias for')} ${player}`}
                    className="px-4 py-2 text-black rounded-lg w-1/2"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={startTournament}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
            >
              {t('Start Tournament')}
            </button>
          </div>
        ) : (
          <>
            {/* Tournament Title */}
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold text-white tracking-wider zen-dots" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                {t('TOURNAMENT')}
              </h1>
              <div className="w-48 h-1 bg-white mx-auto mt-2"></div>
            </div>

            {/* Tournament Bracket */}
            <div className="grid xl:grid-cols-[2fr_1fr] gap-24 grid-cols-1 w-full justify-between items-center text-white">
              <div className="w-full">
                <div className="grid grid-cols lg:grid-cols-2 items-center gap-36 mr-20">
                  {/* Round 1 */}
                  <div className="space-y-16 mt-16 px-4 lg:px-4">
                    {matches.filter(m => m.round === 1).map((match) => (
                      <div key={match.id} className="relative">
                        <div className="flex flex-col gap-4">
                          <div className={`p-0 bg-transparent relative flex items-center overflow-visible rounded-xl transition-all duration-300 ${match.winner === match.player1 ? 'ring-1 ring-white' : ''}`}>
                            <div className="relative bg-black/50 border border-gray-800 overflow-hidden backdrop-blur-sm w-[100%] h-[100px] flex items-center clip-card rounded-xl">
                              <div className="w-[40px] h-full rounded-l-xl bg-[#9a77ff]"></div>
                              <span className="pl-12">{match.player1 || 'TBD'}</span>
                            </div>
                            <div className="absolute left-[100%] top-[50%] w-[13%] h-[2px] bg-white"></div>
                            <div className='absolute left-[113%] top-[50%] w-[2px] h-[118%] bg-white'></div>
                          </div>
                          <div className={`p-0 bg-transparent relative flex items-center overflow-visible transition-all duration-300 rounded-xl ${match.winner === match.player2 ? 'ring-1 ring-white' : ''}`}>
                            <div className="relative bg-black/50 border border-gray-800 overflow-hidden backdrop-blur-sm w-[100%] h-[100px] flex items-center clip-card rounded-xl">
                              <div className="w-[40px] h-full rounded-l-xl bg-[#9a77ff]"></div>
                              <span className="pl-12">{match.player2 || 'TBD'}</span>
                            </div>
                            <div className="absolute left-[100%] top-[50%] w-[13%] h-[2px] bg-white"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Final Round */}
                  <div className="px-4 lg:px-4">
                    {matches.filter(m => m.round === 2).map((match) => (
                      <div key={match.id} className="relative">
                      <div className="flex flex-col gap-4">
                        <div className={`p-0 bg-transparent relative flex items-center overflow-visible rounded-xl transition-all duration-300 ${match.winner === match.player1 ? 'ring-1 ring-white' : ''}`}>
                          <div className="relative bg-black/50 border border-gray-800 overflow-hidden backdrop-blur-sm w-[100%] h-[100px] flex items-center clip-card rounded-xl">
                            <div className="w-[40px] h-full rounded-l-xl bg-[#9a77ff]"></div>
                            <span className="pl-12">{match.player1 || 'TBD'}</span>
                          </div>
                          <div className="absolute left-[100%] top-[50%] w-[13%] h-[2px] bg-white"></div>
                          <div className='absolute left-[113%] top-[50%] w-[2px] h-[118%] bg-white'></div>
                        </div>
                        <div className={`p-0 bg-transparent relative flex items-center overflow-visible transition-all duration-300 rounded-xl ${match.winner === match.player2 ? 'ring-1 ring-white' : ''}`}>
                          <div className="relative bg-black/50 border border-gray-800 overflow-hidden backdrop-blur-sm w-[100%] h-[100px] flex items-center clip-card rounded-xl">
                            <div className="w-[40px] h-full rounded-l-xl bg-[#9a77ff]"></div>
                            <span className="pl-12">{match.player2 || 'TBD'}</span>
                          </div>
                          <div className="absolute left-[100%] top-[50%] w-[13%] h-[2px] bg-white"></div>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Champion Section */}
              <div className="w-full flex flex-col items-center">
                <div className="mb-4">
                  <Trophy className="w-24 h-24 text-yellow-400" />
                  <div className="text-yellow-400 text-2xl font-bold text-center mt-2">CHAMPION</div>
                </div>
                <div className="w-[80%] bg-black/50 border border-gray-800 backdrop-blur-sm rounded-md relative overflow-hidden clip-card h-[100px] flex items-center gap-12">
                  <div className='bg-[url("https://cdn.intra.42.fr/users/3feda8640ab21b2af32e1c3cd703646d/zlaarous.jpg")] bg-cover w-auto h-full aspect-square bg-violet-400'></div>
                  <span className="">
                    {matches.length > 0 && matches[matches.length - 1].winner || 'TBD'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showMatchStartPopup && (
        <div className="z-50 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {matchStartData?.yourName} vs {matchStartData?.opponent} {t('Match starting soon...')}
          </h2>
        </div>
      )}
      <div className="w-full flex items-end flex-col  bottom-4 right-4">
        <div className="flex gap-4">
          <button
            onClick={handleQuit}
            className="px-4 py-2 bg-red-500 text-white rounded-md flex items-center gap-2"
          >
            {t('Quit')}
          </button>
          {tournamentStarted && (
            <button
              onClick={startNextMatch}
              className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center gap-2"
            >
              {t('Start Match')}
            </button>
          )}
        </div>
      </div>

      {champion && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{t('Congratulations')} {champion}!</h2>
          <p className="text-white mb-4">{t('You are the champion!')}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('Go to Dashboard')}
          </button>
        </div>
      )}
    </div>
  );
}

