import { React, useState, useRef, useEffect } from 'react'
import { Trophy } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Tournament() {
  const wsRef = useRef(null);
  const navigate = useNavigate();
  // class Match(models.Model):
  //   player1 = models.CharField(max_length=100)
  //   player2 = models.CharField(max_length=100)
  //   score = models.JSONField(default=dict)
  //   winner = models.CharField(max_length=100, null=True, blank=True)
  //   datetime = models.DateTimeField(auto_now_add=True)
  const [matches, setMatches] = useState([
    { id: 1, round: 1, position: 1, player1: 'Player 1', player2: 'Player 2' },
    { id: 2, round: 1, position: 2, player1: 'Player 3', player2: 'Player 4' },
    { id: 3, round: 2, position: 1 },
  ]);
  const [isReady, setIsReady] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const token = localStorage.getItem('authtoken');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tournamentCode = queryParams.get('code');

  useEffect(() => {
    if (token && !wsRef.current) {
      const accessToken = JSON.parse(token).access;
      wsRef.current = new WebSocket(`ws://localhost:8000/ws/tournament/?token=${accessToken}&code=${tournamentCode}`);

      wsRef.current.onopen = () => {
        console.log('WebSocket connection established');
      };

      wsRef.current.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'token_expired') {
          const newToken = await refreshToken();
          if (newToken) {
            localStorage.setItem('authtoken', JSON.stringify(newToken));
            wsRef.current = new WebSocket('ws://localhost:8000/ws/tournament/?token=' + newToken.access);
            console.log('WebSocket connection established with new token');
          } else {
            localStorage.removeItem('authtoken');
            window.location.href = '/login';
          }
        } else if (message.type === 'tournament_update') {
          setMatches(message.matches);
          console.log('Tournament updated:', message.matches);
        } else if (message.type === 'match_start') {
          console.log('Match started:');
          navigate('/pvp2d');
        }
      };

      wsRef.current.onclose = () => console.log('WebSocket connection closed');
      wsRef.current.onerror = (e) => console.error('WebSocket error:', e);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [token]);

  const handleReady = () => {
    setIsReady(true);
    wsRef.current.send(JSON.stringify({ type: 'player_ready', player_id: playerId }));
  };

  const handleWinnerSelection = (matchId, player) => {
    setMatches(prevMatches => {
      const newMatches = [...prevMatches];
      const currentMatch = newMatches.find(m => m.id === matchId);
      if (currentMatch) {
        currentMatch.winner = player;

        // Find and update next match
        const nextRoundMatch = newMatches.find(m =>
          m.round === currentMatch.round + 1 &&
          Math.ceil(currentMatch.position / 2) === m.position
        );

        if (nextRoundMatch) {
          if (currentMatch.position % 2 === 1) {
            nextRoundMatch.player1 = player;
          } else {
            nextRoundMatch.player2 = player;
          }
        }
      }
      return newMatches;
    });
  };
  return (
    <div className="min-h-screen bg-[#1a1464] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Tournament Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            TOURNAMENT
          </h1>
          <div className="w-48 h-1 bg-white mx-auto mt-2"></div>
        </div>

        {/* Tournament Bracket */}
        <div className="flex justify-between items-center text-black">
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-36 mr-20">
              {/* Round 1 */}
              <div className="space-y-16 mt-16">
                {matches.filter(m => m.round === 1).map((match) => (
                  <div key={match.id} className="relative">
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => match.player1 && handleWinnerSelection(match.id, match.player1)}
                        className={`p-0 bg-transparent relative flex items-center overflow-visible transition-all duration-300 ${match.winner === match.player1? 'ring-2 ring-yellow-400' : ''
                          }`}
                      >
                        <div className="absolute left-[2%] z-[1] w-[60px] h-[90%] bg-[#9a77ff] rounded-tr-[15px] rounded-bl-[15px]"></div>
                        <div className="relative bg-white w-[100%] h-[100px] flex items-center clip-card">
                          <span className="absolute left-[20%] pl-12">{match.player1 || 'TBD'}</span>
                        </div>
                        <div className="absolute left-[100%] top-[50%] w-[13%] h-[2px] bg-white"></div>
                        <div className='absolute left-[113%] top-[50%] w-[2px] h-[120%] bg-white'></div>
                      </button>
                      <button
                        onClick={() => match.player2 && handleWinnerSelection(match.id, match.player2)}
                        className={`p-0 bg-transparent relative flex items-center overflow-visible transition-all duration-300 ${match.winner === match.player2? 'ring-2 ring-yellow-400' : ''
                          }`}
                      >
                        <div className="absolute left-[2%] z-[1] w-[60px] h-[90%] bg-[#9a77ff] rounded-tr-[15px] rounded-bl-[15px]"></div>
                        <div className="relative bg-white w-[100%] h-[100px] flex items-center clip-card">
                          <span className="absolute left-[20%] pl-12">{match.player2 || 'TBD'}</span>
                        </div>
                        <div className="absolute left-[100%] top-[50%] w-[13%] h-[2px] bg-white"></div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final Round */}
              <div className="mt-52">
                {matches.filter(m => m.round === 2).map((match) => (
                  <div key={match.id} className="relative">
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => match.player1 && handleWinnerSelection(match.id, match.player1)}
                        className={`p-0 bg-transparent relative flex items-center overflow-visible transition-all duration-300 ${match.winner === match.player1 ? 'ring-2 ring-yellow-400' : ''
                          }`}
                      >
                        <div className="absolute left-[2%] z-[1] w-[60px] h-[90%] bg-[#9a77ff] rounded-tr-[15px] rounded-bl-[15px]"></div>
                        <div className="relative bg-white w-[100%] h-[100px] flex items-center clip-card">
                          <span className="absolute left-[20%] pl-12">{match.player1 || 'TBD'}</span>
                        </div>
                        <div className="absolute left-[100%] top-[50%] w-[13%] h-[2px] bg-white"></div>
                        <div className='absolute left-[113%] top-[50%] w-[2px] h-[120%] bg-white'></div>
                      </button>
                      <button
                        onClick={() => match.player2 && handleWinnerSelection(match.id, match.player2)}
                        className={`p-0 bg-transparent relative flex items-center overflow-visible transition-all duration-300 ${match.winner === match.player2 ? 'ring-2 ring-yellow-400' : ''
                          }`}
                      >
                        <div className="absolute left-[2%] z-[1] w-[60px] h-[90%] bg-[#9a77ff] rounded-tr-[15px] rounded-bl-[15px]"></div>
                        <div className="relative bg-white w-[100%] h-[100px] flex items-center clip-card">
                          <span className="absolute left-[20%] pl-12">{match.player2 || 'TBD'}</span>
                        </div>
                        <div className="absolute left-[100%] top-[50%] w-[13%] h-[2px] bg-white"></div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Champion Section */}
          <div className="w-[30%] flex flex-col items-center">
            <div className="mb-4">
              <Trophy className="w-24 h-24 text-yellow-400" />
              <div className="text-yellow-400 text-2xl font-bold text-center mt-2">CHAMPION</div>
            </div>
            <div className="w-[80%] h-12 bg-white rounded-md relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-violet-400"></div>
              <span className="pl-12">
                {matches.length > 0 && matches[matches.length - 1].winner || 'TBD'}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 right-4">
        <button
          onClick={handleReady}
          className={`px-4 py-2 bg-green-500 text-white rounded-md ${isReady ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isReady}
        >
          {isReady ? 'Ready' : 'Click to Ready'}
        </button>
      </div>
    </div>
  )
}