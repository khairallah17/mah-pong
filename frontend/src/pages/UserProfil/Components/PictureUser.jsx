import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { WebSocketContext } from '../../../websockets/WebSocketProvider.jsx';
import { Shield, Gamepad2, UserPlus, UserMinus, UserX, Check, X, Loader2 } from 'lucide-react';
import '../../../i18n.js';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { UseProfilContext } from '../../../hooks/useProfilContext.jsx';

import { useAuthContext } from '../../../hooks/useAuthContext.jsx';

const PictureUser = () => {

  const { t } = useTranslation();
  const { user: { username } } = useAuthContext()
  const currentUser = username

  const {
    profil, setProfil,
    playerStats,
    error, setError,
    loading, setLoading,
    pendingRequest,
    friendStatus,
    handleGameInvite,
    handleFriendRequest,
    handleAcceptRequest,
    handleRejectRequest,
    handleCancelRequest,
    handleRemoveFriend,
    fetchProfil,
    currentFriend
  } = UseProfilContext()

  const renderActionButtons = () => {
    if (currentUser === profil?.username) {
      return (
        <div className="space-y-2">
          <NavLink to={`/dashboard/edit-profil`} className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all">
            <Shield className="w-4 h-4" />
            {t('Edit Profile')}
          </NavLink>
          <NavLink to={`/dashboard/game`} className="w-full py-2.5 px-4 bg-navy-700 hover:bg-navy-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all">
            <Gamepad2 className="w-4 h-4" />
            {t('Play Game')}
          </NavLink>
        </div>
      );
    }

    const friendButtons = (() => {

      console.log(friendStatus)

      switch (friendStatus) {
        case 'none':
          return (
            <button 
              onClick={handleFriendRequest}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              {t('Add Friend')}
            </button>
          );
        case 'pending':
          return pendingRequest?.sender_username === currentUser ? (
            <button 
              onClick={handleCancelRequest}
              className="w-full py-2.5 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <UserX className="w-4 h-4" />
              {t('Cancel Request')}
            </button>
          ) : (
            <div className="space-y-2">
              <button 
                onClick={handleAcceptRequest}
                className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Check className="w-4 h-4" />
                {t('Accept Request')}
              </button>
              <button 
                onClick={handleRejectRequest}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <X className="w-4 h-4" />
                {t('Reject Request')}
              </button>
            </div>
          );
        case 'friends':
          return (
            <button 
            onClick={handleRemoveFriend}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <UserMinus className="w-4 h-4" />
            {t('Remove Friend')}
          </button>
          );
        default:
          return null;
      }
    })();

    return (
      <>
        {friendButtons}
        <button onClick={() => handleGameInvite()} className="w-full py-2.5 px-4 bg-navy-700 hover:bg-navy-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all">
                <Gamepad2 className="w-4 h-4" />
                {t('Invite to Game')}
        </button>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {
        loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="relative group">
        <div className="h-32 w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl"></div>
        
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <div className="w-32 h-32 rounded-full ring-4 ring-navy-800 bg-navy-700 overflow-hidden">
              <img 
                src={`/api/usermanagement${profil?.img}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {profil?.is_online && (
              <div className="absolute bottom-2 right-2">
                <div className="w-4 h-4 bg-green-500 rounded-full ring-2 ring-navy-800"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="pt-16 text-center space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-bold text-white">{profil?.fullname}</h2>
            {profil?.profil?.is_verified && (
              <Shield className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <p className="text-gray-400">@{profil?.username}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 px-4">
          <div className="bg-navy-700/50 rounded-lg p-3">
            <div className="text-lg font-bold text-white">
              {playerStats.wins + playerStats.losses || 0}
            </div>
            <div className="text-xs text-gray-400">{t('Games')}</div>
          </div>
          <div className="bg-navy-700/50 rounded-lg p-3">
            <div className="text-lg font-bold text-white">
              {playerStats.wins || 0}
            </div>
            <div className="text-xs text-gray-400">{t('Wins')}</div>
          </div>
          <div className="bg-navy-700/50 rounded-lg p-3">
            <div className="text-lg font-bold text-white">
              {playerStats.losses || 0}
            </div>
            <div className="text-xs text-gray-400">{t('Losses')}</div>
          </div>
        </div>
        <div className="space-y-3 px-4">
          {renderActionButtons()}
        </div>
      </div>
          </>
        )
      }
    </div>
  );
};

export default PictureUser;