import React, { useContext, useState, useEffect } from "react";
import { WebSocketContext } from "../websockets/WebSocketProvider";
import { jwtDecode } from "jwt-decode";

const NotificationDisplay = () => {
  const { notifications: wsNotifications, wsManager } = useContext(WebSocketContext);
  const [alerts, setAlerts] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const accessToken = JSON.parse(localStorage.getItem("authtoken")).access;
        const { username } = jwtDecode(accessToken);
        const response = await fetch(`http://localhost:8002/api/notifications/${username}/`);
        const data = await response.json();
        const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
      const reversedWsNotifications = [...wsNotifications].reverse();
      setNotifications(prevNotifications => [...reversedWsNotifications, ...prevNotifications]);
      console.log("wsNotifications", wsNotifications);
      // increment alerts by the number of new notifications
      setAlerts(prevAlerts => prevAlerts + 1);
    }
  }, [wsNotifications]);

  const toggleNotifications = () => {
    if (!isOpen) {
      wsManager.sendMessage("Notifications viewed");
      // reset Notif as viewed
      setAlerts(0);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="z-50">
      <button
        onClick={toggleNotifications}
        className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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
          <span className="absolute mb-28 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {alerts}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200">
          <div className="py-2">
            <h3 className="text-lg font-semibold px-4 py-2 border-b">Notifications</h3>
            {notifications.length > 0 ? (
              <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <li key={index} className="px-4 py-3 hover:bg-gray-50">
                    <a
                      href={notification.link || '#'}
                      className="text-sm text-gray-800"
                    >
                      {notification.message}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 px-4 py-3">No new notifications</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDisplay;