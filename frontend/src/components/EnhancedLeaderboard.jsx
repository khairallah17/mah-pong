import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';

const EnhancedLeaderboard = ({ players }) => {
  const [sortBy, setSortBy] = useState('winRate');
  const [sortOrder, setSortOrder] = useState('desc');

  const sortedPlayers = [...players].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortBy] - b[sortBy];
    } else {
      return b[sortBy] - a[sortBy];
    }
  });

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  return (
    <motion.div 
      className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-neon border border-cyan-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h2 className="text-3xl font-semibold mb-6 text-cyan-400">Global Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-700">
              <th className="pb-2">Rank</th>
              <th className="pb-2">Player</th>
              <th className="pb-2 cursor-pointer" onClick={() => handleSort('level')}>
                Level
                {sortBy === 'level' && (sortOrder === 'asc' ? <ChevronUp className="inline ml-1" size={16} /> : <ChevronDown className="inline ml-1" size={16} />)}
              </th>
              <th className="pb-2 cursor-pointer" onClick={() => handleSort('winRate')}>
                Win Rate
                {sortBy === 'winRate' && (sortOrder === 'asc' ? <ChevronUp className="inline ml-1" size={16} /> : <ChevronDown className="inline ml-1" size={16} />)}
              </th>
              <th className="pb-2 cursor-pointer" onClick={() => handleSort('wins')}>
                Wins
                {sortBy === 'wins' && (sortOrder === 'asc' ? <ChevronUp className="inline ml-1" size={16} /> : <ChevronDown className="inline ml-1" size={16} />)}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <motion.tr 
                key={player.id}
                className="border-b border-gray-700 last:border-b-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <td className="py-3">
                  {index < 3 ? (
                    <Trophy className={`inline-block mr-1 ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-400' :
                      'text-yellow-700'
                    }`} size={20} />
                  ) : (
                    `#${index + 1}`
                  )}
                </td>
                <td className="py-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2 text-sm font-bold">
                      {player.username[0].toUpperCase()}
                    </div>
                    {player.username}
                  </div>
                </td>
                <td className="py-3">{player.level}</td>
                <td className="py-3">{player.winRate}%</td>
                <td className="py-3">{player.wins}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-300">
        View Full Leaderboard
      </button>
    </motion.div>
  );
};

export default EnhancedLeaderboard;

