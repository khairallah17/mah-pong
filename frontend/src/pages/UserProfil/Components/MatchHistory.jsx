import React, { useContext, useState, useEffect } from 'react';
import AuthContext from "../../../context/AuthContext"
import matchimoji from "../../../images/Frame.svg"
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2'


const MatchHistory = () => {

  const [userMatch, setUserMatch] =  useState([]);
  const { authtoken } = useContext(AuthContext);
  const { username } = useParams();


  useEffect(() => {
      const fetchdata = async () => {

        try {
          const response = await fetch(`/api/game/api/player-stats/${username}/`)

        if (!response.ok) {
          throw new Error('Failed to fetch user stats');
        }

        const data = await response.json();
        setUserMatch(data);
        console.log(data);
        } catch (error) {
          // Swal.fire({
          //   position: "top-end",
          //   icon: "error",
          //   title: "Error fetching match history",
          //   showConfirmButton: true,
          //   timerProgressBar: true,
          //   timer: 3000
          // });
        }
      };
      fetchdata();
      console.log(username);
    }, [userMatch, authtoken]);

    // if (error) return (
    //   <div className="flex items-center justify-center h-screen text-red-500">
    //     Error: {error}
    //   </div>
    // );
    
  const summary = {
    wins: 4,
    losses: 3,
    percentage: 54
  };

  return (
    <div className="bg-[#07073A] p-6 w-[640px] h-[710px] rounded-lg max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <img src={matchimoji} alt="" />
          <h2 className="text-white text-lg font-semibold">Match History</h2>
        </div>
        <div className="flex justify-center bg-[#393434] w-[152px] h-[50px] rounded-lg">
          <p className="content-center text-green-400 font-bold text-lg">{summary.wins}W</p>
          <p className="content-center font-bold m-1">-</p>
          <p className="content-center text-red-400 font-bold text-lg">{summary.losses}L</p>
          <p className="content-center text-[#99ABBF] font-bold text-lg">&nbsp;({summary.percentage}%)</p>
        </div>
      </div>
      <div className="flex justify-center items-center">
          {userMatch.length === 0 ? (
            <p className="">No matches played yet {console.log("hehererer", userMatch)}</p>
          ) : (
            userMatch.map((match) => (
              <div key={match.id} className="mt-2.5 relative">
                      <div className="flex items-center justify-between">
                        <div className="" >{userMatch.datetime}</div>
                          <span className={`w-16 h-6 rounded-lg justify-end text-sm font-bold ${
                            match.result === 'win'
                            ? 'bg-green-400 text-white-400'
                            : 'bg-red-400 text-white-400'
                          }`}>
                            {match.result.toUpperCase()}
                          </span>
                      </div>
                        <div className={`flex items-center justify-center gap-3 border-b ${
                          match.result === 'win'
                          ? 'border-green-400'
                          : 'border-red-400'}`}>
                          <span className="text-white">{match.player}</span>
                          <div className="w-8 h-8 bg-gray-700 rounded-full font-bold"></div>
                          <div className={`flex justify-center content-center w-16 h-6 rounded m-2 ${
                            match.result === 'win' 
                            ? 'bg-green-900/90 text-white-400' 
                            : 'bg-red-900/90 text-white-400'
                          }`}>
                              {match.score_player} <p className="font-bold ">-</p>
                          </div>
                          <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                          <span className="text-white">{match.opponent}</span>
                        </div>
                    </div>
              ))
            )}
        </div>
      </div>
    // </div>
  );
};

export default MatchHistory;