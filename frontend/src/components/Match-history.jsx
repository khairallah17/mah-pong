import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import axios from 'axios';

export const MatchHistory = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const username = "zouhairlrs"; // Replace with actual username
        const response = await fetch(`http://localhost:8000/api/match-history/${username}/`);
        const data = await response.json();
        console.log('Received matches data:', data);
        setMatches(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
        setLoading(false);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      {loading ? (
        // Loading skeletons
        [...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div>
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="h-3 w-20 bg-white/10 rounded mt-2" />
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 w-16 bg-white/10 rounded" />
              <div className="h-3 w-20 bg-white/10 rounded mt-2" />
            </div>
          </div>
        ))
      ) : (
        matches.length > 0 ? (
          matches.map((match) => (
            <div key={match.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                  match.result === 'win' ? 'from-green-500 to-emerald-500' : 'from-purple-500 to-pink-500'
                } flex items-center justify-center`}>
                  <Activity size={20} />
                </div>
                <div>
                  <div className="font-medium">Match #{match.id}</div>
                  <div className="text-sm text-gray-400">vs {match.opponent}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${match.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                  {match.score_player1} - {match.score_player2}
                </div>
                <div className="text-sm text-gray-400">{match.time}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">No matches found</div>
        )
      )}
    </div>
  );
};