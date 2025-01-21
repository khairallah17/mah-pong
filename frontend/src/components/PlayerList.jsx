import React, { useState, useEffect } from 'react';
import { Users, Search, Gamepad2, MessageCircle } from 'lucide-react';
import '../i18n';
import { useTranslation } from 'react-i18next';

export const PlayerList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteCode, setInviteCode] = useState(null);
  
  const { t } = useTranslation();
  useEffect(() => {
    const fetchFriendsWithStats = async () => {
      try {
        // Fetch friends list
        const friendsResponse = await fetch("http://localhost:8001/api/friends/", {
          credentials: "include",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + JSON.parse(localStorage.getItem("authtoken"))?.access,
          },
        });

        if (!friendsResponse.ok) {
          throw new Error('Failed to fetch friends list');
        }

        const friendsData = await friendsResponse.json();
        const friendsList = friendsData[0]?.friends || [];

        // Fetch stats for each friend
        const token = JSON.parse(localStorage.getItem("authtoken"))?.access;
        const friendsWithStats = await Promise.all(
          friendsList.map(async (friend) => {
            try {
              const statsResponse = await fetch(
                `http://localhost:8000/api/player-stats/${friend.username}/`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                }
              );
              
              if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                return {
                  ...friend,
                  nbwin: statsData.nbwin || 0,
                  nblose: statsData.nblose || 0
                };
              }
              return friend;
            } catch (err) {
              console.error(`Error fetching stats for ${friend.username}:`, err);
              return friend;
            }
          })
        );

        setFriends(friendsWithStats);
        setError(null);
      } catch (err) {
        console.error('Error fetching friends:', err);
        setError('Failed to load friends list');
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsWithStats();
    const interval = setInterval(fetchFriendsWithStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredFriends = friends.filter(friend => 
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGameInvite = async (friendId) => {
    try {
      const code = Math.random().toString(36).substring(2, 15);
      setInviteCode(code);
      
      const inviteLink = `${window.location.origin}/dashboard/game/pvp2d?invite=${code}`;
      
      await navigator.clipboard.writeText(inviteLink);
      
      const Alert = ({ message }) => (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {message}
        </div>
      );
      
      alert('Game invite link copied to clipboard!');
    } catch (error) {
      console.error('Error generating invite:', error);
      alert('Failed to generate game invite');
    }
  };

  const handleMessage = (friendId) => {
    console.log('Message friend:', friendId);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8 text-blue-400">
          {t('Loading friends list...')}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center py-8 text-red-400">
          {error}
        </div>
      );
    }

    if (friends.length === 0) {
      return (
        <div className="flex justify-center items-center py-8 text-blue-400/60">
          {t('No friends found. Add some friends to get started!')}
        </div>
      );
    }

    if (filteredFriends.length === 0) {
      return (
        <div className="flex justify-center items-center py-8 text-blue-400/60">
          {t('No friends match your search.')}
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar">
        {filteredFriends.map((friend) => (
          <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-blue-500/5 rounded-lg transition-all border border-transparent hover:border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 p-0.5">
                <img 
                  src={friend.img || 'https://github.com/shadcn.png'} 
                  alt={`${friend.username}'s Avatar`}
                  className="w-full h-full object-cover rounded-[5px]"
                />
              </div>
              <div>
                <div className="font-medium text-blue-50">{friend.username}</div>
                <div className="text-xs text-blue-300/60">
                  {friend.fullname}
                </div>
                <div className="text-xs text-blue-300/60">
                  {t('Wins')}: {friend.nbwin || 0} | {t('Losses')}: {friend.nblose || 0}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="p-2 hover:bg-blue-400/10 rounded-lg transition-all border border-transparent hover:border-blue-400/20 group"
                onClick={() => handleGameInvite(friend.id)}
                title="Invite to game"
              >
                <Gamepad2 size={18} className="text-blue-400 group-hover:text-blue-300" />
              </button>
              <button 
                className="p-2 hover:bg-blue-400/10 rounded-lg transition-all border border-transparent hover:border-blue-400/20 group"
                onClick={() => handleMessage(friend.id)}
                title="Send message"
              >
                <MessageCircle size={18} className="text-blue-400 group-hover:text-blue-300" />
              </button>
              <div 
                className={`h-2 w-2 rounded-full ${
                  friend.is_online 
                    ? 'bg-green-400 shadow-lg shadow-green-400/50' 
                    : 'bg-gray-400 shadow-lg shadow-gray-400/50'
                }`}
                title={friend.is_online ? 'Online' : 'Offline'}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 rounded-xl border border-blue-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="text-blue-400" />
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            {t('Friends List')}
          </h2>
        </div>
        <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
          {friends.length} {t('Friends')}
        </span>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-blue-400/50" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('Search friends...')}
          className="w-full bg-black/40 border border-blue-500/20 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all"
        />
      </div>

      {renderContent()}
    </div>
  );
};

export default PlayerList;