// FullDashboard.jsx
import React, { useState } from 'react';
import { GameModes } from '../components/GameModes';
import { MatchHistory } from '../components/Match-history';
import { Statistics } from '../components/StatisticUser';
import { Achievements } from '../components/AchievementBadgeProps';
import { PlayerList } from '../components/PlayerList';

const FullDashboard = () => {
  const [activeTab, setActiveTab] = useState('matches');
  const [selectedMode, setSelectedMode] = useState(null);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'matches':
        return <MatchHistory />;
      case 'statistics':
        return <Statistics />;
      case 'achievements':
        return <Achievements />;
      default:
        return <MatchHistory />;
    }
  };

  return (
    <div className="w-full h-full">
      <div className="p-4 lg:p-6 space-y-6 mt-[100px]">
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="md:col-span-2 lg:col-span-3 bg-black/50 rounded-xl border border-gray-800 overflow-hidden backdrop-blur-sm">
            <div className="relative h-[450px] lg:h-90">
              <img 
                src="play-1vs1.jpg"
                alt="Ping Pong Arena"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                <div className="absolute bottom-24 left-8 p-6">
                  <h1 className="text-2xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Ping Pong Pro League
                  </h1>
                  <p className="text-gray-300 max-w-xl">
                    Enter the arena, challenge players worldwide, and become the ultimate champion
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1 bg-black/50 rounded-xl border border-gray-800 p-4 backdrop-blur-sm">
            <PlayerList />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2 bg-black/50 rounded-xl border border-gray-800 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              {['matches', 'statistics', 'achievements'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            {renderTabContent()}
          </div>
          <div className="bg-black/50 rounded-xl border border-gray-800 p-4 backdrop-blur-sm">
            <GameModes selectedMode={selectedMode} setSelectedMode={setSelectedMode} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullDashboard;