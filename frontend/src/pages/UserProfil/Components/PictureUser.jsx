import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { WebSocketContext } from '../../../websockets/WebSocketProvider.jsx';
import { Shield, Gamepad2, UserPlus, UserMinus, UserX, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import '../../../i18n.js';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import useWebsocketContext from '../../../hooks/useWebsocketContext.jsx';

import { useAuthContext } from '../../../hooks/useAuthContext.jsx';

const PictureUser = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profil, setProfil] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [friendStatus, setFriendStatus] = useState('none');
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState(true);
  const { wsManager } = useWebsocketContext();
  
  const { username } = useParams();
  const { user , authtoken } = useAuthContext()
  const currentUser = user?.username

  const handleGameInvite = async () => {
    try {
      const code = Math.random().toString(36).substring(2, 15);
      // setInviteCode(code);
      
      navigate(`/dashboard/game/pvp2d?invite=${code}`, {
        replace: true
      });
      wsManager.sendMessage(`${user.username} has invited you to a game!`, [username], `/dashboard/game/pvp2d?invite=${code}`);
    } catch (error) {
      console.error('Error generating invite:', error);
      alert('Failed to generate game invite');
    }
  };

  const checkFriendStatus = async () => {
    try {
        // Check friend requests
        const response = await fetch(`/api/usermanagement/api/friend-requests/`, {
            headers: {
                'Authorization': `Bearer ${authtoken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch friend requests');
        }

        const requests = await response.json();
        setRequests(requests);
        // Check for any pending or accepted requests between the users
        const existingRequest = requests.find(request => 
            (request.sender_username === currentUser && request.receiver_username === username) ||
            (request.sender_username === username && request.receiver_username === currentUser)
        );

        if (existingRequest) {
          setPendingRequest(existingRequest);
          if (existingRequest.status === 'pending') {
              setFriendStatus('pending');
              return;
          } else if (existingRequest.status === 'accepted') {
              setFriendStatus('friends');
              return;
          }
          // setFriendStatus()
        }

        // If no request exists, check friends list
        const friendsResponse = await fetch(`/api/usermanagement/api/friends/`, {
            headers: {
                'Authorization': `Bearer ${authtoken}`
            }
        });

        if (!friendsResponse.ok) {
            throw new Error('Failed to fetch friends list');
        }

        const friendsData = await friendsResponse.json();
        const isFriend = friendsData.friends?.some(friend => friend.username === username);

        setFriendStatus(isFriend ? 'friends' : 'none');
    } catch (err) {
      toast.warn(`Error checking friend status: ${err}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      })
        setFriendStatus('none');
    }
  };

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/usermanagement/api/user-profile/${username}/`);
        if (!response.ok) {
          throw new Error('Profile not found');
        }
        const data = await response.json();
        setProfil(data);
        await checkFriendStatus();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false)
      }
    };

    if (username && authtoken) {
      fetchProfil();
    }
  }, [username, authtoken]);

  const handleFriendRequest = async () => {
    try {
      const response = await fetch('/api/usermanagement/api/friend-requests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authtoken}`
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
      wsManager?.sendMessage(`${currentUser} sent you a friend request`, [username], `/dashboard/profil/${currentUser}`);
    } catch (err) {
      toast.warn(`Error: ${err}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      })
      setError(err.message);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      // First get the pending request ID
      const response = await fetch(`/api/usermanagement/api/friend-requests/`, {
        headers: {
          'Authorization': `Bearer ${authtoken}`
        }
      });
      const requests = await response.json();
      
      const pendingRequest = requests.find(request => 
        request.sender_username === username && 
        request.receiver_username === currentUser &&
        request.status === 'pending'
      );

      if (!pendingRequest) {
        throw new Error('Friend request not found');
      }

      // Accept the request
      const acceptResponse = await fetch(`/api/usermanagement/api/friend-requests/${pendingRequest.id}/accept/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authtoken}`
        }
      });

      if (!acceptResponse.ok) {
        throw new Error('Failed to accept friend request');
      }

      setFriendStatus('friends');
      wsManager?.sendMessage(`${currentUser} accepted your friend request`, [username], `/dashboard/profil/${currentUser}`);
    } catch (err) {
      toast.warn(`Error accepting friend request: ${err}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      })
      setError(err.message);
    }
  };

  const handleRejectRequest = async () => {
    try {
      const response = await fetch(`/api/usermanagement/api/friend-requests/`, {
        headers: {
          'Authorization': `Bearer ${authtoken}`
        }
      });
      const requests = await response.json();
      
      const pendingRequest = requests.find(request => 
        request.sender_username === username && 
        request.receiver_username === currentUser &&
        request.status === 'pending'
      );

      if (!pendingRequest) {
        throw new Error('Friend request not found');
      }

      const rejectResponse = await fetch(`/api/usermanagement/api/friend-requests/${pendingRequest.id}/reject/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authtoken}`
        }
      });

      if (!rejectResponse.ok) {
        throw new Error('Failed to reject friend request');
      }

      setFriendStatus('none');
      wsManager.sendMessage(`${currentUser} Rejected your friend request`, [username], `/dashboard/profil/${currentUser}`);
    } catch (err) {
      toast.warn(`Error rejecting friend request: ${err}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      })
      setError(err.message);
    }
  };

  const handleCancelRequest = async () => {
    try {
      const response = await fetch(`/api/usermanagement/api/friend-requests/`, {
        headers: {
          'Authorization': `Bearer ${authtoken}`
        }
      });
      const requests = await response.json();
      
      const pendingRequest = requests.find(request => 
        request.sender_username === currentUser && 
        request.receiver_username === username &&
        request.status === 'pending'
      );

      if (!pendingRequest) {
        throw new Error('Friend request not found');
      }

      const cancelResponse = await fetch(`/api/usermanagement/api/friend-requests/${pendingRequest.id}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authtoken}`
        }
      });

      if (!cancelResponse.ok) {
        throw new Error('Failed to cancel friend request');
      }

      setFriendStatus('none');
    } catch (err) {
      toast.warn(`Error canceling friend request: ${err}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      })
      setError(err.message);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      const response = await fetch('/api/usermanagement/api/friends/remove/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authtoken}`
        },
        body: JSON.stringify({ username })
      });

      if (!response.ok && response.status != 404) {
        throw new Error('Failed to remove friend');
      }

      setFriendStatus('none');
    } catch (err) {
      toast.warn(`Error removing friend: ${err}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      })
      setError(err.message);
    }
  };

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

  if (error) {
    toast.warn(`${error}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    })
  }


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