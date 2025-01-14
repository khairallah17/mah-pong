// import React, { useEffect, useContext } from 'react';
// import { WebSocketContext } from './WebSocketContext';
// import { jwtDecode } from "jwt-decode";

// const FriendRequestHandler = () => {
//   const { notifications, wsManager } = useContext(WebSocketContext);
//   const token = JSON.parse(localStorage.getItem('authtoken')).access;
//   const currentUser = jwtDecode(token).username;

//   const handleAccept = async (requestId) => {
//     try {
//       const response = await fetch(`http://localhost:8001/friend-requests/${requestId}/accept/`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         // Send notification to sender
//         wsManager?.sendMessage(JSON.stringify({
//           type: 'friend_request_accepted',
//           message: `${currentUser} accepted your friend request`
//         }));
//       }
//     } catch (err) {
//       console.error('Error accepting friend request:', err);
//     }
//   };

//   const handleReject = async (requestId) => {
//     try {
//       await fetch(`http://localhost:8001/friend-requests/${requestId}/reject/`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
//     } catch (err) {
//       console.error('Error rejecting friend request:', err);
//     }
//   };

//   const renderFriendRequest = (notification) => {
//     if (notification.type === 'friend_request') {
//       return (
//         <div key={notification.id} className="fixed top-4 right-4 z-50 bg-navy-800 p-4 rounded-lg shadow-lg">
//           <p className="text-white mb-2">{notification.message}</p>
//           <div className="flex space-x-2">
//             <button
//               onClick={() => handleAccept(notification.request_id)}
//               className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//             >
//               Accept
//             </button>
//             <button
//               onClick={() => handleReject(notification.request_id)}
//               className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//             >
//               Reject
//             </button>
//           </div>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <>
//       {notifications.map(notification => renderFriendRequest(notification))}
//     </>
//   );
// };

// export default FriendRequestHandler;


import React, { useContext } from 'react';
import { WebSocketContext } from '../../../websockets/WebSocketProvider.jsx';
import { jwtDecode } from "jwt-decode";

const FriendRequestHandler = () => {
  const { notifications, wsManager } = useContext(WebSocketContext);
  const token = JSON.parse(localStorage.getItem('authtoken'))?.access;
  const currentUser = token ? jwtDecode(token).username : null;

  const handleAccept = async (requestId, senderUsername) => {
    try {
      const response = await fetch(`http://localhost:8001/api/friend-requests/${requestId}/accept/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Send notification to sender
        wsManager?.sendMessage(`${currentUser} sent you a friend request`, [senderUsername]);
        // wsManager?.sendMessage(JSON.stringify({
        //   type: 'friend_request_accepted',
        //   message: `${currentUser} accepted your friend request`,
        //   to_user: senderUsername
        // }));
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
    }
  };

  const handleReject = async (requestId, senderUsername) => {
    try {
      const response = await fetch(`http://localhost:8001/api/friend-requests/${requestId}/reject/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        // Send notification to sender
        wsManager?.sendMessage(`${currentUser} sent you a friend request`, [senderUsername]);
        // wsManager?.sendMessage(JSON.stringify({
        //   type: 'friend_request_accepted',
        //   message: `${currentUser} accepted your friend request`,
        //   to_user: senderUsername
        // }));
      }
    } catch (err) {
      console.error('Error rejecting friend request:', err);
    }
  };

  const friendRequestNotifications = notifications.filter(
    notification => notification.type === 'friend_request'
  );

  if (friendRequestNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {friendRequestNotifications.map((notification) => (
        <div 
          key={notification.id} 
          className="bg-navy-800 rounded-xl p-4 shadow-lg border border-gray-700 min-w-[300px]"
        >
          <p className="text-white mb-3">
            {notification.message}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => handleAccept(notification.request_id, notification.from_user)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => handleReject(notification.request_id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequestHandler;