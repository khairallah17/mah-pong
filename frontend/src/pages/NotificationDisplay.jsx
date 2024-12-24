import React, { useContext, useState, useEffect} from "react";
import { WebSocketContext } from "../WebSocketProvider/WebSocketProvider";

const NotificationDisplay = () => {
  const { notifications: wsNotifications, wsManager } = useContext(WebSocketContext);
  const [notifications, setNotifications] = useState([]);
  // old notifications that are not read should still be considered new
  // old notifications that are read should be considered old
  // new notifications that are read should be considered old
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("http://localhost:8002/api/notifications");
        const data = await response.json();
        const oldNotifications = data.filter((notification) => notification.read);
        console.log("oldNotifications", oldNotifications);
        console.log("data", data);
        const combinedNotifications = [...oldNotifications, ...wsNotifications];
        setNotifications(combinedNotifications);
      } catch (error) {
        console.error(error);
      }
    };

    fetchNotifications();
  }, [wsNotifications]);

  const [isOpen, setIsOpen] = useState(false);

  const toggleNotifications = () => {
    if (!isOpen)
      wsManager.sendMessage("Notifications viewed");
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
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
        {notifications.length > 0 && (
          <span className="absolute top-4 right-4 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {wsNotifications.length}
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
                    <p className="text-sm text-gray-800">{notification.message}</p>
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
