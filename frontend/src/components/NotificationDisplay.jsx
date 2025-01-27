import React, { useContext, useState, useEffect } from "react";
import { WebSocketContext } from "../websockets/WebSocketProvider";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { UserCircle, UserPlus, UserCheck, X } from "lucide-react";
import '../i18n';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from "../hooks/useAuthContext";

const NotificationDisplay = () => {
  const { t } = useTranslation();
  const { notifications: wsNotifications, wsManager } = useContext(WebSocketContext);
  const [alerts, setAlerts] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { user } = useAuthContext()
    const { username } = user

  useEffect(() => {
    const fetchNotifications = async () => {
      try {

        const response = await fetch(`/api/notifications/api/notifications/${username}/`);
        const data = await response.json();
        const sortedData = data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        const unreadNotifications = sortedData.filter(notification => !notification.read);
        setNotifications(sortedData);
        setAlerts(unreadNotifications.length);
      } catch (error) {
        console.error(error);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (wsNotifications.length > 0) {
      setNotifications(prevNotifications => {
        const updated = [...prevNotifications];
        wsNotifications.forEach(newNotif => {
          const idx = updated.findIndex(n => n.id === newNotif.id);
          if (idx >= 0) {
            updated[idx] = newNotif;
          } else {
            updated.unshift(newNotif);
          }
        });
        return updated.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      });
      setAlerts(prev => prev + 1);
    }
  }, [wsNotifications]);

  const toggleNotifications = () => {
    if (!isOpen) {
      wsManager.sendMessage("Notifications viewed");
      setAlerts(0);
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification) => {
    navigate(notification.link);
    setIsOpen(false);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ${t('ago')}`;
    if (hours < 24) return `${hours}h ${t('ago')}`;
    return `${days}d ${t('ago')}`;
  };

  const getNotificationStyle = (message) => {
    if (message.includes('accepted your friend request')) {
      return {
        icon: <UserCheck className="w-4 h-4 text-emerald-500" />,
        bgColor: "bg-emerald-50",
        borderColor: "border-l-emerald-500"
      };
    } else if (message.includes("Reject your friend request")) {
      return {
        icon: <X className="w-4 h-4 text-red-500" />,
        bgColor: "bg-red-50",
        borderColor: "border-l-red-500"
      };
    } else if (message.includes("sent you a friend request")) {
      return {
        icon: <UserPlus className="w-4 h-4 text-blue-500" />,
        bgColor: "bg-blue-50",
        borderColor: "border-l-blue-500"
      };
    }
    return {
      icon: null,
      bgColor: "",
      borderColor: ""
    };
  };

  const renderNotificationContent = (message) => {
    const [username, ...rest] = message.split(" ");
    return (
      <>
        <span className="font-semibold text-gray-900">{username}</span>
        <span className="text-gray-600"> {t(rest.join(" "))}</span>
      </>
    );
  };

  return (
    <div className="z-50 relative">
      {/* Notification Button */}
      <button
        onClick={toggleNotifications}
        className="p-2 rounded-full hover:bg-blue-950 relative transition-colors duration-200"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {alerts > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
            {alerts}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Container */}
          <div className="fixed top-16 overflow-hidden right-2 left-2 md:absolute md:right-0 md:left-auto md:top-full md:mt-2 max-h-[80vh] w-auto md:w-96 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
            <div className="flex flex-col max-h-[80vh] h-[300px]">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-lg font-semibold text-gray-800">{t('Notifications')}</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {/* Notifications List */}
              <div className="overflow-y-scroll !h-[300px] flex-1">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => {
                    const style = getNotificationStyle(notification.message);
                    return (
                      <div
                        key={notification.id || index}
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${style.bgColor} ${style.borderColor}`}
                      >
                        <div className="flex items-start space-x-3">
                          {notification.sender_image ? (
                            <img
                              src={notification.sender_image}
                              alt="User"
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <UserCircle className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm break-words">
                                {renderNotificationContent(notification.message)}
                              </p>
                              {style.icon}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimestamp(notification.created_at)}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse" />
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-6 text-center">
                    <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{t('No notifications yet')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDisplay;