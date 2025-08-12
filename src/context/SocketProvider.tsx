"use client";

import React, { createContext, useContext, useRef, useEffect, useState, useCallback } from 'react';
import config from '@/config/config';

// Tipo para el contexto
interface SocketContextType {
  socket: any;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Lazy load socket.io-client y crear singleton
  const getSocket = useCallback(async () => {
    if (!socketRef.current) {
      const { default: io } = await import('socket.io-client');
      socketRef.current = io(config.SOCKET_URL, config.SOCKET_CONFIG);
    }
    return socketRef.current;
  }, []);

  useEffect(() => {
    let active = true;
    getSocket().then(socket => {
      if (!active) return;
      setIsConnected(socket.connected);
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
    });
    return () => {
      active = false;
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
      }
    };
  }, [getSocket]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
