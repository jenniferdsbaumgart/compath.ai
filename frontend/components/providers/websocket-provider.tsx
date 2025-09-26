'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken, isAuthenticated } from '@/lib/auth';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
});

export function useWebSocketContext() {
  return useContext(WebSocketContext);
}

interface WebSocketProviderProps {
  children: ReactNode;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    const token = getToken();
    if (!token) {
      return;
    }

    console.log('Initializing WebSocket connection...');

    // Initialize socket connection
    const newSocket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      upgrade: true,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection...');
      newSocket.close();
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

