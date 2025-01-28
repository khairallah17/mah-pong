import React, { useState, useEffect } from 'react';
import { GameModes } from '../components/GameModes';
import { MatchHistory } from '../components/Match-history';
import { Statistics } from '../components/StatisticUser';
import { Achievements } from '../components/AchievementBadgeProps';
import  PlayerList  from '../components/PlayerList';
import '../i18n';
import { useTranslation } from 'react-i18next';
import useUserContext from '../hooks/useUserContext';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('matches');
  const [selectedMode, setSelectedMode] = useState(null);
  const { t } = useTranslation()  

  const { loading } = useUserContext()

  const renderTabContent = () => {
    switch (activeTab) {
      case 'matches':
        return <MatchHistory />;
      case 'statistics':
        return <Statistics />;
      default:
        return <MatchHistory />;
    }
  };
  
  const tabs = ['matches', 'statistics'];

  return (
    <div className="w-full h-full">
      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid xl:grid-cols-3 gap-4 xl:gap-6">
          <div className="xl:col-span-2 bg-black/50 rounded-xl border border-gray-800 overflow-hidden backdrop-blur-sm">
            <div className="relative hidden md:block h-[450px] xl:h-90">
              <img 
                src="play-1vs1.jpg"
                alt="Ping Pong Arena"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                <div className="absolute bottom-24 left-8 p-6">
                  <h1 className="text-2xl xl:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    {t('Ping Pong Pro League')}
                  </h1>
                  <p className="text-gray-300 max-w-xl">
                    {t('Enter the arena, challenge players worldwide, and become the ultimate champion')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {
            loading ? (
              <div role="status" className="min-h-56 h-full w-full animate-pulse xl:col-span-1">
                  <div className="h-full w-full bg-gray-700 rounded-xl"></div>
              </div>
            ) : (
              <div className="lg:col-span-1 bg-black/50 rounded-xl border border-gray-800 p-2 backdrop-blur-sm">
                <PlayerList />
              </div>
            )
          }
        </div>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
            {
              
              loading ? (
                <div role="status" className="min-h-56 h-full w-full animate-pulse lg:col-span-2">
                  <div className="h-full w-full bg-gray-700 rounded-xl"></div>
              </div>
              ) : (
                <div className="lg:col-span-2 bg-black/50 rounded-xl border border-gray-800 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-6">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                          activeTab === tab ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        {t(tab)}
                      </button>
                    ))}
                  </div>
                  {renderTabContent()}
                </div>
              )

            }
          <div className="bg-black/50 rounded-xl border border-gray-800 p-4 backdrop-blur-sm">
            <GameModes selectedMode={selectedMode} setSelectedMode={setSelectedMode} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;