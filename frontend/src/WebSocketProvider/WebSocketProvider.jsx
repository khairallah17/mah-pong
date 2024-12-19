import React, { createContext, useEffect, useState } from "react";
import WebSocketManager from "./WebSocketManager";

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const accessToken = JSON.parse(localStorage.getItem('authtoken')).access;
  const webSocketUrl = 'ws://localhost:8000/ws/matchmaking/?token=' + accessToken;
  
  useEffect(() => {
    const wsManager = new WebSocketManager(webSocketUrl);

    wsManager.connect((message) => {
      setNotifications((prev) => [...prev, JSON.parse(message)]);
    });

    wsManager.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'token_expired') {
            const newToken = await refreshToken();
            if (newToken) {
                localStorage.setItem('authtoken', JSON.stringify(newToken));
                wsManager = new WebSocket('ws://localhost:8000/ws/matchmaking/?token=' + newToken.access);
                console.log('WebSocket connection established with new token');
            } else {
                localStorage.removeItem('authtoken');
                window.location.href = '/login';
            }
        }
    }
    return () => {
      wsManager.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ notifications }}>
      {children}
    </WebSocketContext.Provider>
  );
};
