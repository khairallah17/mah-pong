import React, { useEffect, useState } from 'react';
import { PictureUser } from './UserProfil/Components/';
import { MatchHistory } from '../components/Match-history';
import { Statistics } from '../components/StatisticUser';
import { GripHorizontal } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import '../i18n';
import { useTranslation } from 'react-i18next';
import { UseProfilContext } from '../hooks/useProfilContext';

const Profile = () => {

  const {
    activeTab, setActiveTab,
    totalGames,
    winRate,
    fetchStats,
    profil,
    fetchProfil,
    currentFriend,
    username,
    loading
  } = UseProfilContext();

  const { t } = useTranslation();


  useEffect(() => {

      Promise.all([fetchStats(), fetchProfil()])

  }, [currentFriend, username]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950">
      {/* Background Pattern with Animation */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGM0LjQxOCAwIDgtMy41ODIgOC04cy0zLjU4Mi04LTgtOC04IDMuNTgyLTggOCAzLjU4MiA4IDggOHoiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] 
                opacity-5 animate-pulse"></div>

      {/* Main Content Container */}
      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {
        loading ? (
          <p>Loading...</p>
        ): (
          profil?.username ? (
            <>
                {/* Mobile Profile Section */}
                <div className="lg:hidden mb-6">
                  <div className="bg-navy-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/10 transition-all hover:border-white/20">
                    <PictureUser />
                  </div>
                </div>

                {/* Main Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Sidebar - Desktop */}
                  <div className="hidden lg:block lg:col-span-3">
                    <div className="sticky top-8 transition-all">
                      <div className="bg-navy-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/10 hover:border-white/20">
                        <PictureUser />
                        
                        {/* Quick Stats - Desktop Only */}
                        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-400">{totalGames || 0}</div>
                            <div className="text-sm text-gray-400">{t('total Games')}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-400">{winRate}</div>
                            <div className="text-sm text-gray-400">{t('win Rate')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="lg:col-span-9 space-y-6">
                    {/* Custom Tab Navigation */}
                    <div className="bg-navy-800/70 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">
                      <div className="flex border-b border-white/10">
                        <button
                          onClick={() => setActiveTab('stats')}
                          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors
                            ${activeTab === 'stats' 
                              ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-400' 
                              : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                          {t('Statistics Overview')}
                        </button>
                        <button
                          onClick={() => setActiveTab('matches')}
                          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors
                            ${activeTab === 'matches' 
                              ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-400' 
                              : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                          {t('Recent Matches')}
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="p-6">
                        {activeTab === 'stats' && (
                          <div className="space-y-6">
                            <div className="flex items-center gap-2">
                              <GripHorizontal className="w-5 h-5 text-indigo-400" />
                              <h2 className="text-xl font-semibold text-white">{t('Statistics Overview')}</h2>
                            </div>
                            <Statistics />
                          </div>
                        )}
                        {activeTab === 'matches' && (
                          <div className="space-y-6">
                            <div className="flex items-center gap-2">
                              <GripHorizontal className="w-5 h-5 text-indigo-400" />
                              <h2 className="text-xl font-semibold text-white">{t('Recent Matches')}</h2>
                            </div>
                            <MatchHistory />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
            </>
          ) : (
            <div className='flex flex-col items-center justify-center'>
              <h3 className='lg:text-7xl sm:text-4xl text-xl border-b-2 pb-4 uppercase'>{t("we can't find this user")}</h3>
              <p className='uppercase md:text-[30rem] sm:text-[15rem] text-[8rem] leading-[1] font-bold'>404</p>
              <h3 className='md:text-7xl sm:text-4xl text-xl border-t-2 pt-4 uppercase'>{t("user lost")}</h3>
            </div>
          )
        )
      }      
  
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy-950 to-transparent"></div>
    </div>
  );
};

export default Profile;