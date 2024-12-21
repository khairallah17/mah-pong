import React, { createContext, useEffect, useState } from "react";
import WebSocketManager from "./WebSocketManager";

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const accessToken = JSON.parse(localStorage.getItem('authtoken'))?.access;
  const webSocketUrl = 'ws://localhost:8000/ws/notifications/?token=' + accessToken;
  const [wsManager, setWsManager] = useState(null);
  
  useEffect(() => {
    let wsManagerInstance = new WebSocketManager(webSocketUrl);
    setWsManager(wsManagerInstance);

    wsManagerInstance.connect((message) => {
      setNotifications((prev) => [...prev, JSON.parse(message)]);
    });

    wsManagerInstance.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'token_expired') {
          console.log('Token expired, refreshing...');
            const newToken = await refreshToken();
            if (newToken) {
                localStorage.setItem('authtoken', JSON.stringify(newToken));
                wsManagerInstance.close();
                wsManagerInstance = new WebSocket('ws://localhost:8000/ws/notifications/?token=' + newToken?.access);
                setWsManager(wsManagerInstance);
                wsManagerInstance.connect((message) => {
                  setNotifications((prev) => [...prev, JSON.parse(message)]);
                });
                console.log('WebSocket connection established with new token');
            } else {
                localStorage.removeItem('authtoken');
                window.location.href = '/login';
            }
        }
    }
    return () => {
      wsManagerInstance.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ notifications, wsManager }}>
      {children}
    </WebSocketContext.Provider>
  );
};
