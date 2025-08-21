'use client'
import { useCachedSocketData } from '../context/CacheProvider';
import { useCallback } from 'react';

// Hook de compatibilidad que mantiene la interfaz original
export function useSocketData() {
  const {
    status,
    recortes,
    recortesUtilizados,
    maquinas,
    clientes,
    recortesDisponibles,
    recortesUtilizadosUltimoMes,
    porcentajeRecortesPorMaquina,
    isLoaded,
    socket,
    isConnected,
  } = useCachedSocketData();

  // Función de callback para actualización de recortes (compatibilidad)
  const setRecorteUpdateCallback = useCallback((callback: (recorte: any) => void) => {
    if (!socket) return;

    const handleRecorteUpdate = (recorte: any) => {
      callback(recorte);
    };

    socket.on('recorteUpdated', handleRecorteUpdate);
    socket.on('recorteUtilizado', handleRecorteUpdate);
    socket.on('recorteDisponibleUpdated', handleRecorteUpdate);

    // Retornar función de limpieza
    return () => {
      socket.off('recorteUpdated', handleRecorteUpdate);
      socket.off('recorteUtilizado', handleRecorteUpdate);
      socket.off('recorteDisponibleUpdated', handleRecorteUpdate);
    };
  }, [socket]);

  return {
    status,
    recortes,
    recortesUtilizados,
    maquinas,
    clientes,
    recortesDisponibles,
    recortesUtilizadosUltimoMes,
    porcentajeRecortesPorMaquina,
    isLoaded,
    socket,
    isConnected,
    setRecorteUpdateCallback,
  };
}
