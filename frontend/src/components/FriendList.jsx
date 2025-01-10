// src/components/Friends/FriendsList.jsx
import React, { useState, useEffect } from 'react';
import './Friends.css';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/friends/', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch friends');
      const data = await response.json();
      setFriends(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    console.log(data);
  };

  // const searchUsers = async () => {
  //   if (!searchTerm.trim()) return;
    
  //   try {
  //     const response = await fetch(`http://localhost:8000/api/users/search/?query=${searchTerm}`, {
  //       headers: getAuthHeaders()
  //     });
  //     if (!response.ok) throw new Error('Failed to search users');
  //     const data = await response.json();
  //     setSearchResults(data);
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // };

  // const sendFriendRequest = async (userId) => {
  //   try {
  //     const response = await fetch(`http://localhost:8000/api/friends/request/send/${userId}/`, {
  //       method: 'POST',
  //       headers: getAuthHeaders()
  //     });
  //     if (!response.ok) {
  //       const data = await response.json();
  //       throw new Error(data.error || 'Failed to send request');
  //     }
  //     setSearchResults(searchResults.filter(user => user.id !== userId));
  //     alert('Friend request sent successfully!');
  //   } catch (err) {
  //     alert(err.message);
  //   }
  // };

  // const removeFriend = async (userId) => {
  //   if (!window.confirm('Are you sure you want to remove this friend?')) return;

  //   try {
  //     const response = await fetch(`http://localhost:8000/api/friends/${userId}/remove/`, {
  //       method: 'POST',
  //       headers: getAuthHeaders()
  //     });
  //     if (!response.ok) throw new Error('Failed to remove friend');
  //     fetchFriends();
  //   } catch (err) {
  //     alert(err.message);
  //   }
  // };

  if (loading) return <div className="friends-loading">Loading...</div>;
  if (error) return <div className="friends-error">{error}</div>;

  return (
    <div className="friends-container">
      {/* Search Section */}
      <div className="search-section">
        <h2>Find Friends</h2>
        <div className="search-box">
          {/* <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="search-input"
          /> */}
          {/* <button onClick={searchUsers} className="search-button">
            Search
          </button> */}
        </div>

        {/* Search Results */}
        {/* <div className="search-results">
          {searchResults.map(user => (
            <div key={user.id} className="user-card">
              <img 
                src={user.img} 
                alt={user.username} 
                className="user-avatar"
              />
              <div className="user-info">
                <h3>{user.fullname}</h3>
                <p>@{user.username}</p>
              </div>
              <button 
                // onClick={() => sendFriendRequest(user.id)}
                // className="add-friend-button"
              >
                Add Friend
              </button>
            </div>
          ))}
        </div> */}
      </div>

      {/* Friends List */}
      <div className="friends-list">
        <h2>My Friends</h2>
        {friends.length === 0 ? (
          <p className="no-friends">You haven't added any friends yet.</p>
        ) : (
          friends.map(friend => (
            <div key={friend.id} className="friend-card">
              <img 
                src={friend.friend.img} 
                alt={friend.friend.username} 
                className="friend-avatar"
              />
              <div className="friend-info">
                <h3>{friend.friend.fullname}</h3>
                <p>@{friend.friend.username}</p>
                <div className={`online-status ${friend.friend.is_online ? 'online' : 'offline'}`}>
                  {friend.friend.is_online ? 'Online' : 'Offline'}
                </div>
              </div>
              {/* <button 
                onClick={() => removeFriend(friend.friend.id)}
                className="remove-friend-button"
              >
                Remove
              </button> */}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// src/components/Friends/FriendRequests.jsx
import React, { useState, useEffect } from 'react';
import './Friends.css';

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/friends/x/', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId, action) => {
    try {
      const response = await fetch(`http://localhost:8000/api/friends/request/${requestId}/${action}/`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`Failed to ${action} request`);
      fetchRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="friends-loading">Loading...</div>;
  if (error) return <div className="friends-error">{error}</div>;

  return (
    <div className="friend-requests-container">
      <h2>Friend Requests</h2>
      {requests.length === 0 ? (
        <p className="no-requests">No pending friend requests</p>
      ) : (
        <div className="requests-list">
          {requests.map(request => (
            <div key={request.id} className="request-card">
              <img 
                src={request.from_user.img} 
                alt={request.from_user.username} 
                className="user-avatar"
              />
              <div className="request-info">
                <h3>{request.from_user.fullname}</h3>
                <p>@{request.from_user.username}</p>
              </div>
              <div className="request-actions">
                <button 
                  onClick={() => handleRequest(request.id, 'accept')}
                  className="accept-button"
                >
                  Accept
                </button>
                <button 
                  onClick={() => handleRequest(request.id, 'reject')}
                  className="reject-button"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRequests;