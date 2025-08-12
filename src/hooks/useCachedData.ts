'use client'
import { useCachedSocketData } from '@/context/CacheProvider';
import { useState, useCallback } from 'react';

/**
 * Hook de compatibilidad que mantiene la misma interfaz que useSocketData
 * pero utiliza el nuevo sistema de caché por debajo
 */
export function useSocketData() {
  const cachedData = useCachedSocketData();
  const [recorteUpdateCallback, setRecorteUpdateCallback] = useState<((recorte: any) => void) | null>(null);

  // Mantener compatibilidad con el callback de actualización
  const setCallback = useCallback((callback: ((recorte: any) => void) | null) => {
    setRecorteUpdateCallback(callback);
  }, []);

  return {
    ...cachedData,
    setRecorteUpdateCallback: setCallback,
  };
}

/**
 * Hook principal que utiliza el sistema de caché
 * Recomendado para nuevos componentes
 */
export { useCachedSocketData as useOptimizedSocketData } from '@/context/CacheProvider';