import React from 'react';

const MatchHistory = ({ UserPlay }) => {
  const matches = [
    { id: 1, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '2', result: 'LOST', time: '13:37s' },
    { id: 2, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '10', result: 'WON', time: '13:37s' },
    { id: 3, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '2', result: 'LOST', time: '13:37s' },
    { id: 4, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '5', result: 'WON', time: '13:37s' },
    { id: 5, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '5', result: 'LOST', time: '13:37s' },
    { id: 6, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '5', result: 'WON', time: '13:37s' },
    { id: 7, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '7', result: 'WON', time: '13:37s' },
    { id: 8, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '5', result: 'WON', time: '13:37s' },
    { id: 9, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '5', result: 'LOST', time: '13:37s' },
    { id: 10, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '5', result: 'LOST', time: '13:37s' },
    { id: 11, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '5', result: 'WON', time: '13:37s' },
    { id: 12, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '7', result: 'WON', time: '13:37s' },
  ];
  // const fetchdata = async () => {
  //   url = UserPlay
  // }

  const summary = {
    wins: 4,
    losses: 3,
    percentage: 54
  };

  return (
    <div className="bg-[#07073A] p-6 rounded-lg max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-white text-lg font-semibold">Match History</h2>
        </div>
        <div className="flex justify-center bg-[#393434] w-[152px] h-[50px] items-center">
          <p className="text-green-400 font-bold text-lg">{summary.wins}W</p>
          <p className="font-bold m-1">-</p>
          <p className="text-red-400 font-bold text-lg">{summary.losses}L</p>
          <p className="text-[#99ABBF] font-bold text-lg">&nbsp;({summary.percentage}%)</p>
        </div>
      </div>

      {/* <div className="space-y-2"> */}
        {matches.map((match) => (
          <div key={match.id} className="mt-2.5 relative">
            <div className="flex items-center justify-between">
              <div className="" >{match.date}</div>
                <span className={`w-16 h-6 rounded-lg justify-end text-sm font-bold ${
                  match.result === 'WON'
                    ? 'bg-green-400 text-white-400'
                    : 'bg-red-400 text-white-400'
                }`}>
                  {match.result}
                </span>
            </div>
              <div className={`flex items-center justify-center gap-3 border-b ${
                  match.result === 'WON'
                    ? 'border-green-400'
                    : 'border-red-400'}`}>
                <span className="text-white">{match.player1}</span>
                <div className="w-8 h-8 bg-gray-700 rounded-full font-bold"></div>
                <div className={`flex justify-center content-center w-16 h-6 rounded m-2 ${
                    match.result === 'WON' 
                      ? 'bg-green-900/90 text-white-400' 
                      : 'bg-red-900/90 text-white-400'
                  }`}>
                    {match.score} <p className="font-bold ">-</p> {match.score}
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <span className="text-white">{match.player2}</span>
              </div>
          </div>
        ))}
      {/* </div> */}
    </div>
  );
};

export default MatchHistory;