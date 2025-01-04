import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, MessageCircle, UserCheck, X } from 'lucide-react';
import axios from 'axios';

const FriendManagement = () => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch friends list
  const fetchFriends = async () => {
    try {
      const response = await axios.get('/api/friends/');
      setFriends(response.data);
    } catch (error) {
      setError('Error fetching friends list');
      console.error('Error:', error);
    }
  };

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get('/api/friend-requests/');
      setPendingRequests(response.data);
    } catch (error) {
      setError('Error fetching pending requests');
      console.error('Error:', error);
    }
  };

  // Search users
  const searchUsers = async (term) => {
    if (!term) {
      setSearchResults([]);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/search/?q=${term}`);
      setSearchResults(response.data);
    } catch (error) {
      setError('Error searching users');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send friend request
  const sendFriendRequest = async (userId) => {
    try {
      await axios.post('/api/friends/', { user_id: userId });
      setSearchResults(searchResults.map(user => 
        user.id === userId 
          ? { ...user, requestSent: true }
          : user
      ));
    } catch (error) {
      setError('Error sending friend request');
      console.error('Error:', error);
    }
  };

  // Handle friend request
  const handleFriendRequest = async (requestId, action) => {
    try {
      await axios.post('/api/friend-requests/', {
        request_id: requestId,
        action: action
      });
      fetchPendingRequests();
      fetchFriends();
    } catch (error) {
      setError(`Error ${action}ing friend request`);
      console.error('Error:', error);
    }
  };

  // Remove friend
  const removeFriend = async (friendId) => {
    try {
      await axios.post(`/api/friends/${friendId}/remove/`);
      fetchFriends();
    } catch (error) {
      setError('Error removing friend');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchUsers(searchTerm);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Update online status periodically
  useEffect(() => {
    const updateStatus = async () => {
      try {
        await axios.post('/api/online-status/');
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };

    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError(null)} className="float-right">×</button>
        </div>
      )}

      {/* Search Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Find Friends</h2>
        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-2 border rounded mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map(user => (
              <div key={user.id} className="border rounded p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <span className={`inline-block w-2 h-2 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-400'} mr-2`} />
                  {user.is_online ? 'Online' : 'Offline'}
                </div>
                {!user.requestSent && (
                  <button
                    onClick={() => sendFriendRequest(user.id)}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  >
                    <UserPlus size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Pending Requests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingRequests.map(request => (
            <div key={request.id} className="border rounded p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{request.sender.username}</p>
                  <p className="text-sm text-gray-500">
                    {request.sender.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFriendRequest(request.id, 'accept')}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                  >
                    <UserCheck size={20} />
                  </button>
                  <button
                    onClick={() => handleFriendRequest(request.id, 'decline')}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Friends List Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">My Friends</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.map(friend => (
            <div key={friend.id} className="border rounded p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{friend.username}</p>
                  <p className="text-sm text-gray-500">{friend.email}</p>
                  <div className="flex items-center mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${friend.is_online ? 'bg-green-500' : 'bg-gray-400'} mr-2`} />
                    {friend.is_online ? 'Online' : 'Offline'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    onClick={() => {/* Handle chat */}}
                  >
                    <MessageCircle size={20} />
                  </button>
                  <button
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    onClick={() => removeFriend(friend.id)}
                  >
                    <UserMinus size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendManagement;