import React, { useContext, useState, useEffect } from 'react';
import AuthContext from "../../../context_login_Register/AuthContext"

const MatchHistory = ({ UserPlay }) => {
  // const matches = [
  //   { id: 1, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '2', result: 'LOST', time: '13:37s' },
  //   { id: 2, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '10', result: 'WON', time: '13:37s' },
  //   { id: 3, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '2', result: 'LOST', time: '13:37s' },
  //   { id: 4, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '5', result: 'WON', time: '13:37s' },
  //   { id: 5, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '5', result: 'LOST', time: '13:37s' },
  //   { id: 6, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '5', result: 'WON', time: '13:37s' },
  //   { id: 7, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '7', result: 'WON', time: '13:37s' },
  //   { id: 8, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '5', result: 'WON', time: '13:37s' },
  //   { id: 9, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '5', result: 'LOST', time: '13:37s' },
  //   { id: 10, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '5', result: 'LOST', time: '13:37s' },
  //   { id: 11, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '5', result: 'WON', time: '13:37s' },
  //   { id: 12, date: '23:32, Wed, Dec 6', player1: 'ven', player2: 'mohammed', score: '7', result: 'WON', time: '13:37s' },
  // ];
  const [userMatch, setUserMatch] = useState(null);
  const { authtoken } = useContext(AuthContext);

    useEffect(() => {
        const fetchdata = async () => {

          url = UserPlay
          ? `http://localhost:8001/api/match-history/${UserPlay}/`
          : 'http://localhost:8001api/match-history/';

          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${authtoken?.access}`,
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user stats');
          }

          const data = await response.json();
          setUserMatch(data);
          console.log(data);
        };
        fetchdata();
      }, [UserPlay, authtoken]);

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
          <p className="text-green-400 font-bold text-lg">{userMatch.player}W</p>
          <p className="font-bold m-1">-</p>
          <p className="text-red-400 font-bold text-lg">{summary.losses}L</p>
          <p className="text-[#99ABBF] font-bold text-lg">&nbsp;({summary.percentage}%)</p>
        </div>
      </div>

      {/* <div className="space-y-2"> */}
        {/* {matches.map((userMatch) => (
          <div key={userMatch.id} className="mt-2.5 relative">
            <div className="flex items-center justify-between">
              <div className="" >{userMatch.datetime}</div>
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
                <span className="text-white">{setUserMatch.player}</span>
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
        ))} */}
      {/* </div> */}
    </div>
  );
};

export default MatchHistory;