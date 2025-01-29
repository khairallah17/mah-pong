import React, { useState, useEffect, useRef } from 'react';
import { useSidebarContext } from '../hooks/useSidebar';
import { Search, X, Menu, Bell, UserPlus } from 'lucide-react';
import DefaultAvatar from '../assets/khr.jpg';
import NotificationDisplay from './NotificationDisplay';
import ButtonLng from "../components/ButtonLng";
import '../i18n';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import useUserContext from '../hooks/useUserContext';

import Logo from "../assets/logo.png"

const Navbar = () => {
  const navigate = useNavigate();
  const { toggleSidebar, open } = useSidebarContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const { authtoken, user } = useAuthContext()
  const { fetchUserData, loading } = useUserContext()

  useEffect(() => {
    fetchUserData();
  }, [authtoken]);

  const searchUsers = async (query) => {

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    try {
      // First, get the list of friends to filter them out
      const friendsResponse = await fetch(`/api/usermanagement/api/friends/`, {
        headers: { 'Authorization': `Bearer ${authtoken}` }
      });
      const friendsData = await friendsResponse.json();
      const friendsList = friendsData[0]?.friends || [];
      const friendUsernames = new Set(friendsList.map(friend => friend.username));

      // Then, fetch all users
      const allUsersResponse = await fetch(`/api/usermanagement/api/allusers/?search=${query}`, {
        headers: { 'Authorization': `Bearer ${authtoken}` }
      });
      const allUsersData = await allUsersResponse.json();

      // Filter out friends and current user from the results
      const filteredUsers = allUsersData.filter(searchedUser =>  
        searchedUser.username !== user.username &&
        (searchedUser.fullname?.toLowerCase().includes(query.toLowerCase()) ||
          searchedUser.username.toLowerCase().includes(query.toLowerCase()) ||
          searchedUser.email?.toLowerCase().includes(query.toLowerCase()))
      );

      setSearchResults(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (username) => {
    navigate(`/dashboard/profil/${username}`);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-sm border-b border-white/10">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 focus:outline-none lg:flex hidden"
            aria-label={open ? "Close sidebar" : "Open sidebar"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <NavLink to="/dashboard">
            <img src={Logo} className='w-16 h-auto aspect-auto ml-[-10px]' alt="" />
          </NavLink>
        </div>

        <div className="flex-1 max-w-2xl mx-4" ref={searchRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-white/50" />
            </div>
            <input
              type="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="w-full h-9 pl-10 pr-4 rounded-full bg-white/10 text-sm text-white placeholder-white/50 border-none focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            
            {showResults && searchQuery && (
              <div className="absolute w-full mt-2 bg-gray-800 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-white text-center">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div>
                    {searchResults.map((searchedUser) => (
                      <div
                        key={searchedUser.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setShowResults(false);
                          setSearchQuery('');
                          handleUserClick(searchedUser.username);
                        }}
                      >
                        <img
                          src={"/api/usermanagement/" + searchedUser.img || searchedUser.avatar || DefaultAvatar}
                          alt={searchedUser.username}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = DefaultAvatar;
                          }}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">
                            {searchedUser.fullname || searchedUser.username}
                          </div>
                          <div className="text-xs text-white/60">
                            {searchedUser.email}
                          </div>
                        </div>
                        <UserPlus className="h-5 w-5 text-white/60 hover:text-white" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-white text-center">No users found</div>
                )}
              </div>
            )}
          </div>
        </div>


            <div className="flex items-center gap-4">
              <ButtonLng />
              <div 
                className="p-4 rounded-md text-white/80 focus:outline-none"
                aria-label="Notifications"
              >
                <NotificationDisplay className="h-5 w-5" />
              </div>
              {

                  loading ? (
                    <div role="status" className="flex items-center gap-3 animate-pulse">
                      <div className="hidden md:block text-right space-y-2">
                        <div className="text-sm font-medium text-white w-12 h-2 rounded-full bg-white/20"></div>
                        <div className="text-xs bg-white/20 h-2 w-16 rounded-full text-white/60"></div>
                      </div>
                        <NavLink to={`/dashboard/profil/${user.username}`}>
                          <div className="h-12 w-12 rounded-full object-cover ring-2 bg-white/20 ring-white/20 cursor-pointer hidden md:block"/>
                        </NavLink>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="hidden md:block text-right">
                        <div className="text-sm font-medium text-white">{user.fullname}</div>
                        <div className="text-xs text-white/60">{user.email}</div>
                      </div>
                        <NavLink to={`/dashboard/profil/${user.username}`}>
                          <img
                            src={user.img ? `/api/usermanagement${user.img}` : DefaultAvatar}
                            alt={`${user.fullname}'s avatar`}
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20 cursor-pointer hidden md:block"
                            onError={(e) => {
                              e.target.src = DefaultAvatar;
                            }}
                          />
                        </NavLink>
                    </div>
                  )

              }
            </div>
      </div>
    </nav>
  );
};

export default Navbar;
