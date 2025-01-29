// GameModes.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Gamepad2, Swords, Users, Clock, Star } from 'lucide-react';
import '../i18n';
import { useTranslation } from 'react-i18next';

export const GameModes = () => {
  const { t } = useTranslation();
  const [selectedMode, setSelectedMode] = useState(null);
  const navigate = useNavigate();

  const gameModes = [
    {
      id: '2d-mode',
      title: t('2d mode'),
      path: '/dashboard/game',
      slideIndex: 0,
      icon: <Gamepad2 className="w-6 h-6" />,
      description: t('Play in a 2D environment: Remote or AI'),
      color: 'from-teal-400 to-green-500',
      stats: {
        difficulty: t('Medium'),
      }
    },
    {
      id: 'tournament',
      title: t('Tournament'),
      path: '/dashboard/tournament/tournamentPage',
      slideIndex: 2,
      icon: <Trophy className="w-6 h-6" />,
      description: t('Join competitive tournaments'),
      color: 'from-violet-400 to-purple-500',
      stats: {
        difficulty: t('Expert'),
      }
    }
  ];

  const handleStartGame = () => {
    const selectedGame = gameModes.find(mode => mode.id === selectedMode);
    if (selectedGame) {
      navigate(selectedGame.path, { state: { initialSlide: selectedGame.slideIndex } });
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          {t('Game Modes')}
        </h2>
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-4">
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
            <div className={`
              absolute inset-0 bg-gradient-to-br ${mode.color} opacity-20
              group-hover:opacity-30 transition-opacity duration-300
            `} />
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors" />

            <div className="relative p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className={`
                  p-3 rounded-xl bg-gradient-to-br ${mode.color}
                  shadow-lg shadow-black/50
                `}>
                  {mode.icon}
                </div>
                <div className="flex items-center gap-1">
                    {mode.id === '2d-mode' && (
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    )}
                    {mode.id === '3d-mode' && (
                      <>
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      </>
                    )}
                    {mode.id === 'tournament' && (
                      <>
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      </>
                    )}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">{mode.title}</h3>
                <p className="text-sm text-gray-400">{mode.description}</p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users size={14} className="text-blue-400" />
                  <span className="text-gray-300">{mode.stats.players}</span>
                </div>
                <div className={`
                  px-2 py-0.5 rounded-full text-xs font-medium
                  ${mode.stats.difficulty === 'Expert' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-yellow-500/20 text-yellow-400'}
                `}>
                  {mode.stats.difficulty}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedMode && (
        <div className="mt-8">
          <button
            onClick={handleStartGame}
            className={`
              w-full py-4 rounded-xl font-bold text-lg
              bg-gradient-to-r ${gameModes.find(m => m.id === selectedMode)?.color}
              transform transition-all duration-300
              hover:scale-105 hover:shadow-lg
            `}
          >
            {t('Start Game')}
          </button>
        </div>
      )}
    </div>
  );
};