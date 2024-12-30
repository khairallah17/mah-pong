import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, MessageCircle } from 'lucide-react';

const EnhancedFriendsList = ({ friends }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-neon border border-cyan-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <h2 className="text-3xl font-semibold mb-6 text-cyan-400">Friends</h2>
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search friends..."
          className="w-full bg-gray-700 text-white rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {filteredFriends.map((friend) => (
          <motion.div
            key={friend.id}
            className="bg-gray-700 bg-opacity-50 p-4 rounded-md flex items-center justify-between"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                friend.online ? 'bg-green-500' : 'bg-gray-500'
              }`}>
                {friend.username[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-lg">{friend.username}</p>
                <p className="text-sm text-cyan-300">Level {friend.level}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className={`p-2 rounded-full ${friend.online ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}`}
                disabled={!friend.online}
                onClick={() => setSelectedFriend(friend)}
                aria-label={`Challenge ${friend.username}`}
              >
                Challenge
              </button>
              <button
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-700"
                onClick={() => alert(`Messaging ${friend.username}`)}
                aria-label={`Message ${friend.username}`}
              >
                <MessageCircle size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      <button className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center">
        <UserPlus size={20} className="mr-2" />
        Add New Friend
      </button>
      <AnimatePresence>
        {selectedFriend && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedFriend(null)}
          >
            <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-bold mb-4">Challenge {selectedFriend.username}</h3>
              <p className="mb-4">Are you ready to face off against {selectedFriend.username} in an epic ping pong battle?</p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  onClick={() => setSelectedFriend(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                  onClick={() => {
                    alert(`Challenge sent to ${selectedFriend.username}!`);
                    setSelectedFriend(null);
                  }}
                >
                  Send Challenge
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EnhancedFriendsList;

