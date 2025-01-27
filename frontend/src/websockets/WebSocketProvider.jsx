<<<<<<< HEAD
import React, { createContext, useEffect, useState } from "react";
import WebSocketManager from "./WebSocketManager";
import { Navigate, useNavigate } from "react-router-dom";

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const accessToken = JSON.parse(localStorage.getItem('authtoken'))?.access;
  const webSocketUrl = 'ws://localhost:8002/ws/notifications/?token=' + accessToken;
  const [wsManager, setWsManager] = useState(null);

  useEffect(() => {
    let wsManagerInstance = new WebSocketManager(webSocketUrl);
    setWsManager(wsManagerInstance);

    const handleMessage = async (data) => {
      const message = JSON.parse(data);
      if (message.type === 'token_expired' || message.type === 'invalid_token') {
        console.log('Token expired, refreshing...');
        const newToken = await refreshToken();
        if (newToken) {
          localStorage.setItem('authtoken', JSON.stringify(newToken));
          wsManagerInstance.close();
          wsManagerInstance.setUrl('ws://localhost:8002/ws/notifications/?token=' + newToken?.access);
          wsManagerInstance.connect(handleMessage);
          console.log('WebSocket connection established with new token');
        } else {
          localStorage.removeItem('authtoken');
          navigate('/login');
        }
      } else if (message.type === 'other') {
        // Handle other message types
      } else {
        setNotifications((prev) => [...prev, message]);
      }
    };

    wsManagerInstance.connect(handleMessage);

    const refreshToken = async () => {
      return null;
      let refreshtokenUrl = "http://localhost:8001/api/token/refresh/"
      try {
        const response = await fetch(refreshtokenUrl, {
          method: 'POST',
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          return data;
        } else {
          return null;
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
      }
    };

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
=======
import React, { createContext, useEffect, useState } from "react";
import WebSocketManager from "./WebSocketManager";
import { Navigate, useNavigate } from "react-router-dom";

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const accessToken = JSON.parse(localStorage.getItem('authtoken'))?.access;
  const webSocketUrl = 'ws://localhost/api/notifications/ws/notifications/?token=' + accessToken;
  const [wsManager, setWsManager] = useState(null);

  useEffect(() => {
    let wsManagerInstance = new WebSocketManager(webSocketUrl);
    setWsManager(wsManagerInstance);

    const handleMessage = async (data) => {
      const message = JSON.parse(data);
      if (message.type === 'token_expired' || message.type === 'invalid_token') {
        console.log('Token expired, refreshing...');
        const newToken = await refreshToken();
        if (newToken) {
          localStorage.setItem('authtoken', JSON.stringify(newToken));
          wsManagerInstance.close();
          wsManagerInstance.setUrl('ws://localhost/api/notifications/ws/notifications/?token=' + newToken?.access);
          wsManagerInstance.connect(handleMessage);
          console.log('WebSocket connection established with new token');
        } else {
          localStorage.removeItem('authtoken');
          navigate('/login');
        }
      } else if (message.type === 'other') {
        // Handle other message types
      } else {
        setNotifications((prev) => [...prev, message]);
      }
    };

    wsManagerInstance.connect(handleMessage);

    const refreshToken = async () => {
      return null;
      let refreshtokenUrl = "/api/usermanagement/api/token/refresh/"
      try {
        const response = await fetch(refreshtokenUrl, {
          method: 'POST',
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          return data;
        } else {
          return null;
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
      }
    };

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
>>>>>>> master
