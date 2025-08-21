"use client";

import React, { createContext, useContext, useRef, useEffect, useState, useCallback } from 'react';
import config from '@/config/config';

// Tipo para el contexto
interface SocketContextType {
  socket: any;
  isConnected: boolean;
  forceReconnect: () => void;
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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [socketState, setSocketState] = useState<any>(null);

  // Lazy load socket.io-client y crear singleton
  const getSocket = useCallback(async () => {
    if (!socketRef.current) {
      const { default: io } = await import('socket.io-client');
      socketRef.current = io(config.SOCKET_URL, {
        ...config.SOCKET_CONFIG,
        // Configuración mejorada para reconexión
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });
      setSocketState(socketRef.current);
    }
    return socketRef.current;
  }, []);

  useEffect(() => {
    let active = true;
    getSocket().then(socket => {
      if (!active) return;
      
      setIsConnected(socket.connected);
      
      socket.on('connect', () => {
        console.log('Socket conectado');
        setIsConnected(true);
        // Limpiar timeout de reconexión si existe
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });
      
      socket.on('disconnect', (reason: unknown) => {
        console.log('Socket desconectado:', reason);
        setIsConnected(false);
      });
      
      socket.on('connect_error', (error: unknown) => {
        console.error('Error de conexión socket:', error);
        setIsConnected(false);
      });
      
      socket.on('reconnect', (attemptNumber: number) => {
        console.log('Socket reconectado después de', attemptNumber, 'intentos');
        setIsConnected(true);
      });
      
      socket.on('reconnect_error', (error: unknown) => {
        console.error('Error de reconexión:', error);
      });
      
      socket.on('reconnect_failed', () => {
        console.error('Falló la reconexión del socket');
        setIsConnected(false);
      });
    });
    
    return () => {
      active = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('reconnect');
        socketRef.current.off('reconnect_error');
        socketRef.current.off('reconnect_failed');
      }
    };
  }, [getSocket]);

  // Función para forzar reconexión manual
  const forceReconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
  }, []);

  return (
    <SocketContext.Provider value={{ 
      socket: socketState, 
      isConnected,
      forceReconnect 
    }}>
      {children}
    </SocketContext.Provider>
  );
};
