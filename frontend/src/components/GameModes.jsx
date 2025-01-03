// GameModes.jsx
import React from 'react';
import { Trophy, Gamepad2, Swords, GraduationCap, Users, Clock, Star } from 'lucide-react';

export const GameModes = ({ selectedMode, setSelectedMode }) => {
  const gameModes = [
    {
      id: 'ranked',
      title: 'Ranked Match',
      icon: <Trophy className="w-6 h-6" />,
      description: 'Compete in intense ranked matches',
      color: 'from-amber-400 to-orange-500',
      stats: { 
        players: '1,234',
        difficulty: 'High',
        xpMultiplier: '2.5x'
      }
    },
    {
      id: 'casual',
      title: 'Casual Play',
      icon: <Gamepad2 className="w-6 h-6" />,
      description: 'Play relaxed, unranked matches',
      color: 'from-emerald-400 to-green-500',
      stats: {
        players: '2,567',
        difficulty: 'Medium',
        xpMultiplier: '1x'
      }
    },
    {
      id: 'tournament',
      title: 'Tournament',
      icon: <Swords className="w-6 h-6" />,
      description: 'Join competitive tournaments',
      color: 'from-violet-400 to-purple-500',
      stats: {
        players: '456',
        difficulty: 'Expert',
        xpMultiplier: '3x'
      }
    },
    {
      id: 'training',
      title: 'Training Mode',
      icon: <GraduationCap className="w-6 h-6" />,
      description: 'Practice and improve your skills',
      color: 'from-sky-400 to-blue-500',
      stats: {
        players: '789',
        difficulty: 'Custom',
        xpMultiplier: '0.5x'
      }
    }
  ];

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Game Modes
        </h2>
        <div className="mt-2 flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-400" />
            <span className="text-sm text-gray-400">5,046 Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-green-400" />
            <span className="text-sm text-gray-400">Next Tournament: 2h 15m</span>
          </div>
        </div>
      </div>

      {/* Game Modes Grid */}
      <div className="grid grid-cols-2 gap-4">
        {gameModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setSelectedMode(mode.id)}
            className={`
              group relative overflow-hidden rounded-2xl
              ${selectedMode === mode.id ? 'ring-2 ring-offset-2 ring-offset-gray-900' : ''}
              transition-all duration-300 ease-out hover:scale-[1.02]
            `}
          >
            {/* Background Effects */}
            <div className={`
              absolute inset-0 bg-gradient-to-br ${mode.color} opacity-20
              group-hover:opacity-30 transition-opacity duration-300
            `} />
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors" />

            {/* Content */}
            <div className="relative p-6 h-full">
              {/* Top Section */}
              <div className="flex items-start justify-between mb-4">
                <div className={`
                  p-3 rounded-xl bg-gradient-to-br ${mode.color}
                  shadow-lg shadow-black/50
                `}>
                  {mode.icon}
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-400">
                    {mode.stats.xpMultiplier}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">{mode.title}</h3>
                <p className="text-sm text-gray-400">{mode.description}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users size={14} className="text-blue-400" />
                  <span className="text-gray-300">{mode.stats.players}</span>
                </div>
                <div className={`
                  px-2 py-0.5 rounded-full text-xs font-medium
                  ${mode.stats.difficulty === 'High' ? 'bg-red-500/20 text-red-400' :
                    mode.stats.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    mode.stats.difficulty === 'Expert' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-blue-500/20 text-blue-400'}
                `}>
                  {mode.stats.difficulty}
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedMode === mode.id && (
                <>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/0 via-white to-white/0" />
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-white/0 via-white to-white/0" />
                </>
              )}
            </div>

            {/* Hover Effect */}
            <div className={`
              absolute inset-0 opacity-0 group-hover:opacity-100
              bg-gradient-to-t from-black/80 via-transparent to-transparent
              transition-opacity duration-300
            `} />
          </button>
        ))}
      </div>

      {/* Action Button */}
      {selectedMode && (
        <div className="mt-8">
          <button className={`
            w-full py-4 rounded-xl font-bold text-lg
            bg-gradient-to-r ${gameModes.find(m => m.id === selectedMode)?.color}
            transform transition-all duration-300
            hover:scale-105 hover:shadow-lg hover:shadow-current/30
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-current
          `}>
            Start Game
          </button>
        </div>
      )}
    </div>
  );
};