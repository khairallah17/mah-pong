import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { WebSocketContext } from '../../../websockets/WebSocketProvider.jsx';
import { Shield, Gamepad2, UserPlus, UserMinus, UserX, Check, X, Loader2 } from 'lucide-react';

const PictureUser = () => {
  const [profil, setProfil] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [friendStatus, setFriendStatus] = useState('none');
  const [isLoading, setIsLoading] = useState(true);
  const { username } = useParams();
  const token = JSON.parse(localStorage.getItem('authtoken'))?.access;
  const currentUser = token ? jwtDecode(token).username : null;
  const { wsManager } = useContext(WebSocketContext);

  const checkFriendStatus = async () => {
    try {
      // First request - friend requests
      const requestsResponse = await fetch(`http://localhost:8001/api/friend-requests/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!requestsResponse.ok) {
        throw new Error('Failed to fetch friend requests');
      }

      const requestsData = await requestsResponse.json();
      setRequests(requestsData);
      
      const existingRequest = requestsData.find(request => 
        (request.sender_username === currentUser && request.receiver_username === username) ||
        (request.sender_username === username && request.receiver_username === currentUser)
      );

      if (existingRequest) {
        setPendingRequest(existingRequest);
        setFriendStatus(existingRequest.status === 'pending' ? 'pending' : 'friends');
        return;
      }

      // Second request - friends list
      const friendsResponse = await fetch(`http://localhost:8001/api/friends/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!friendsResponse.ok) {
        throw new Error('Failed to fetch friends list');
      }

      const friendsData = await friendsResponse.json();
      setFriendStatus(friendsData.friends?.some(friend => friend.username === username) ? 'friends' : 'none');
    } catch (err) {
      console.error('Error checking friend status:', err);
      setFriendStatus('none');
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch profile data
        const profileResponse = await fetch(`http://localhost:8001/api/user-profile/${username}/`);
        if (!profileResponse.ok) {
          throw new Error('Profile not found');
        }
        const profileData = await profileResponse.json();
        
        // Fetch player stats
        const statsResponse = await fetch(`http://localhost:8000/api/player-stats/${username}/`);
        if (!statsResponse.ok) {
          throw new Error('Stats not found');
        }
        const statsData = await statsResponse.json();
        
        // Combine the data
        setProfil(profileData);
        setPlayerStats(statsData);
        
        if (token) {
          await checkFriendStatus();
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchAllData();
    }
  }, [username, token]);

  const handleFriendRequest = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/friend-requests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiver: username })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to send friend request');
      }

      const newRequest = await response.json();
      setPendingRequest(newRequest);
      setFriendStatus('pending');
      wsManager?.sendMessage(`${currentUser} sent you a friend request`, [username]);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      const requestsResponse = await fetch(`http://localhost:8001/api/friend-requests/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const requestsData = await requestsResponse.json();
      
      const pendingRequest = requestsData.find(request => 
        request.sender_username === username && 
        request.receiver_username === currentUser &&
        request.status === 'pending'
      );

      if (!pendingRequest) {
        throw new Error('Friend request not found');
      }

      const acceptResponse = await fetch(`http://localhost:8001/api/friend-requests/${pendingRequest.id}/accept/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!acceptResponse.ok) {
        throw new Error('Failed to accept friend request');
      }

      setFriendStatus('friends');
      wsManager?.sendMessage(`${currentUser} accepted your friend request`, [username]);
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError(err.message);
    }
  };

  const handleRejectRequest = async () => {
    try {
      const requestsResponse = await fetch(`http://localhost:8001/api/friend-requests/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const requestsData = await requestsResponse.json();
      
      const pendingRequest = requestsData.find(request => 
        request.sender_username === username && 
        request.receiver_username === currentUser &&
        request.status === 'pending'
      );

      if (!pendingRequest) {
        throw new Error('Friend request not found');
      }

      const rejectResponse = await fetch(`http://localhost:8001/api/friend-requests/${pendingRequest.id}/reject/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!rejectResponse.ok) {
        throw new Error('Failed to reject friend request');
      }

      setFriendStatus('none');
      wsManager?.sendMessage(`${currentUser} rejected your friend request`, [username]);
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      setError(err.message);
    }
  };

  const handleCancelRequest = async () => {
    try {
      const requestsResponse = await fetch(`http://localhost:8001/api/friend-requests/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const requestsData = await requestsResponse.json();
      
      const pendingRequest = requestsData.find(request => 
        request.sender_username === currentUser && 
        request.receiver_username === username &&
        request.status === 'pending'
      );

      if (!pendingRequest) {
        throw new Error('Friend request not found');
      }

      const cancelResponse = await fetch(`http://localhost:8001/api/friend-requests/${pendingRequest.id}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!cancelResponse.ok) {
        throw new Error('Failed to cancel friend request');
      }

      setFriendStatus('none');
    } catch (err) {
      console.error('Error canceling friend request:', err);
      setError(err.message);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/friends/remove/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });

      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }

      setFriendStatus('none');
    } catch (err) {
      console.error('Error removing friend:', err);
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 p-6 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="relative group">
        <div className="h-32 w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl"></div>
        
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <div className="w-32 h-32 rounded-full ring-4 ring-navy-800 bg-navy-700 overflow-hidden">
              <img 
                src={`http://localhost:8001${profil?.img}`}
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

      {/* Profile Info */}
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

        {/* Updated Stats Grid with Player Stats */}
        <div className="grid grid-cols-3 gap-4 px-4">
          <div className="bg-navy-700/50 rounded-lg p-3">
            <div className="text-lg font-bold text-white">
              {playerStats ? playerStats.wins + playerStats.losses : 0}
            </div>
            <div className="text-xs text-gray-400">Games</div>
          </div>
          <div className="bg-navy-700/50 rounded-lg p-3">
            <div className="text-lg font-bold text-white">
              {playerStats ? playerStats.wins : 0}
            </div>
            <div className="text-xs text-gray-400">Wins</div>
          </div>
          <div className="bg-navy-700/50 rounded-lg p-3">
            <div className="text-lg font-bold text-white">
              {playerStats ? playerStats.losses : 0}
            </div>
            <div className="text-xs text-gray-400">Losses</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 px-4">
          {currentUser === profil?.username ? (
            <div className="space-y-2">
              <button className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all">
                <Shield className="w-4 h-4" />
                Edit Profile
              </button>
              <button className="w-full py-2.5 px-4 bg-navy-700 hover:bg-navy-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all">
                <Gamepad2 className="w-4 h-4" />
                Play Game
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {friendStatus === 'none' && (
                <button 
                  onClick={handleFriendRequest}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Friend
                </button>
              )}
              
              {friendStatus === 'pending' && pendingRequest?.sender_username === currentUser && (
                <button 
                  onClick={handleCancelRequest}
                  className="w-full py-2.5 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <UserX className="w-4 h-4" />
                  Cancel Request
                </button>
              )}
              
              {friendStatus === 'pending' && pendingRequest?.sender_username !== currentUser && (
                <div className="space-y-2">
                  <button 
                    onClick={handleAcceptRequest}
                    className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    Accept Request
                  </button>
                  <button 
                    onClick={handleRejectRequest}
                    className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Reject Request
                  </button>
                </div>
              )}
              
              {friendStatus === 'friends' && (
                <button 
                  onClick={handleRemoveFriend}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <UserMinus className="w-4 h-4" />
                  Remove Friend
                </button>
              )}
              
              <button className="w-full py-2.5 px-4 bg-navy-700 hover:bg-navy-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all">
                <Gamepad2 className="w-4 h-4" />
                Invite to Game
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PictureUser;