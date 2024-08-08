import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface WebSocketProviderProps {
  children: ReactNode;
}

interface WebSocketContextType {
  ws: WebSocket | null;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    if (username) {
      const ws = new WebSocket('ws://localhost:8000/ws/matchmaking/');
      ws.onopen = () => {
        console.log('WebSocket connection established');
        ws.send(JSON.stringify({ type: 'set_username', username }));
        console.log('Username sent:', username);
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
      };
      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
      setWs(ws);

      // Cleanup function to close WebSocket connection when component unmounts
      return () => {
        ws.close();
      };
    }
  }, [username]);

  return (
    <WebSocketContext.Provider value={{ ws, setUsername }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use the WebSocket context
const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export { WebSocketProvider, useWebSocket };