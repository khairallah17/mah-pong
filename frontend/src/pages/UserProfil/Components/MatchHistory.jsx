import React from 'react';

const MatchHistory = () => {
  const matches = [
    { id: 1, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '2-5', result: 'LOST', time: '13:37s' },
    { id: 2, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '10-5', result: 'WON', time: '13:37s' },
    { id: 3, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '2-5', result: 'LOST', time: '13:37s' },
    { id: 4, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '10-5', result: 'WON', time: '13:37s' },
    { id: 5, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '2-5', result: 'LOST', time: '13:37s' },
    { id: 6, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '10-5', result: 'WON', time: '13:37s' },
    { id: 7, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '10-5', result: 'WON', time: '13:37s' },
  ];

  const summary = {
    wins: 4,
    losses: 3,
    percentage: 54
  };

  return (
    <div className="bg-navy-900 p-6 rounded-lg max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-white text-lg font-semibold">Match History</h2>
        </div>
      </div>

      <div className="space-y-2">
        {matches.map((match) => (
          <div key={match.id} className="relative">
            <div className="text-gray-500 text-xs mb-1">{match.date}</div>
            <div className="bg-gray-800 rounded p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-white">{match.player1}</span>
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className={`px-3 py-1 rounded ${
                  match.result === 'WON' 
                    ? 'bg-green-900/50 text-green-400' 
                    : 'bg-red-900/50 text-red-400'
                }`}>
                  {match.score}
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <span className="text-white">{match.player2}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">{match.time}</span>
                <span className={`text-sm font-medium ${
                  match.result === 'WON'
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {match.result}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchHistory;