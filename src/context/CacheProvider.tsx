'use client'
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useSocket } from './SocketProvider';
import config from '@/config/config';

interface Maquina {
  id: string;
  nombre: string;
}

interface Cliente {
  id: string;
  cliente: string;
  espesor: number;
  tipoMaterial: string;
  largo: number;
  ancho: number;
  cantidad: number;
  remito: number;
  observaciones?: string;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Recorte {
  observaciones: string;
  id: string;
  largo: number;
  ancho: number;
  espesor: number;
  cantidad: number;
  estado: boolean;
  imagen?: string;
  maquinaId: string;
  Maquina?: Maquina;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface EstadisticasTiempoReal {
  resumen: {
    totalRecortes: number;
    recortesDisponibles: number;
    recortesUtilizados: number;
    porcentajeDisponibles: string;
    porcentajeUtilizados: string;
  };
  estadisticasPorMaquina: Array<{
    maquina: {
      id: string;
      nombre: string;
    };
    totalRecortes: number;
    disponibles: number;
    utilizados: number;
  }>;
  actividadReciente: any[];
  timestamp: string;
}

interface CacheState {
  recortes: Recorte[];
  recortesUtilizados: Recorte[];
  maquinas: Maquina[];
  clientes: Cliente[];
  estadisticas: EstadisticasTiempoReal | null;
  isLoaded: {
    recortes: boolean;
    maquinas: boolean;
    clientes: boolean;
    estadisticas: boolean;
  };
  lastFetch: {
    recortes: number | null;
    maquinas: number | null;
    clientes: number | null;
    estadisticas: number | null;
  };
}

type CacheAction =
  | { type: 'SET_RECORTES'; payload: Recorte[] }
  | { type: 'MERGE_RECORTES'; payload: Recorte[] }
  | { type: 'ADD_RECORTE'; payload: Recorte }
  | { type: 'UPDATE_RECORTE'; payload: Recorte }
  | { type: 'DELETE_RECORTE'; payload: string }
  | { type: 'SET_MAQUINAS'; payload: Maquina[] }
  | { type: 'SET_CLIENTES'; payload: Cliente[] }
  | { type: 'ADD_CLIENTE'; payload: Cliente }
  | { type: 'UPDATE_CLIENTE'; payload: Cliente }
  | { type: 'DELETE_CLIENTE'; payload: string }
  | { type: 'SET_ESTADISTICAS'; payload: EstadisticasTiempoReal }
  | { type: 'SET_LOADED'; payload: { key: keyof CacheState['isLoaded']; value: boolean } }
  | { type: 'SET_LAST_FETCH'; payload: { key: keyof CacheState['lastFetch']; value: number } }
  | { type: 'CLEAR_CACHE' };

const initialState: CacheState = {
  recortes: [],
  recortesUtilizados: [],
  maquinas: [],
  clientes: [],
  estadisticas: null,
  isLoaded: {
    recortes: false,
    maquinas: false,
    clientes: false,
    estadisticas: false,
  },
  lastFetch: {
    recortes: null,
    maquinas: null,
    clientes: null,
    estadisticas: null,
  },
};

function cacheReducer(state: CacheState, action: CacheAction): CacheState {
  switch (action.type) {
    case 'SET_RECORTES':
      return {
        ...state,
        recortes: action.payload,
        // estado=false => utilizado
        recortesUtilizados: action.payload.filter(r => !r.estado),
      };
    case 'MERGE_RECORTES': {
      // Unir por id manteniendo los más recientes de payload
      const existingById = new Map(state.recortes.map(r => [r.id, r] as const));
      for (const r of action.payload) {
        existingById.set(r.id, r);
      }
      const merged = Array.from(existingById.values());
      return {
        ...state,
        recortes: merged,
        // estado=false => utilizado
        recortesUtilizados: merged.filter(r => !r.estado),
      };
    }
    case 'ADD_RECORTE':
      const newRecortes = [action.payload, ...state.recortes];
      return {
        ...state,
        recortes: newRecortes,
        // Si viene como utilizado (estado=false) agregamos a utilizados
        recortesUtilizados: !action.payload.estado
          ? [action.payload, ...state.recortesUtilizados]
          : state.recortesUtilizados,
      };
    case 'UPDATE_RECORTE':
      const updatedRecortes = state.recortes.map(r => 
        r.id === action.payload.id ? action.payload : r
      );
      // estado=false => utilizado
      const updatedRecortesUtilizados = action.payload.estado
        ? state.recortesUtilizados.filter(r => r.id !== action.payload.id)
        : (state.recortesUtilizados.some(r => r.id === action.payload.id)
            ? state.recortesUtilizados.map(r => r.id === action.payload.id ? action.payload : r)
            : [action.payload, ...state.recortesUtilizados]);
      return {
        ...state,
        recortes: updatedRecortes,
        recortesUtilizados: updatedRecortesUtilizados,
      };
    case 'DELETE_RECORTE':
      return {
        ...state,
        recortes: state.recortes.filter(r => r.id !== action.payload),
        recortesUtilizados: state.recortesUtilizados.filter(r => r.id !== action.payload),
      };
    case 'SET_MAQUINAS':
      return {
        ...state,
        maquinas: action.payload,
      };
    case 'SET_CLIENTES':
      return {
        ...state,
        clientes: action.payload,
      };
    case 'ADD_CLIENTE':
      return {
        ...state,
        clientes: [action.payload, ...state.clientes],
      };
    case 'UPDATE_CLIENTE':
      return {
        ...state,
        clientes: state.clientes.map(c => 
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_CLIENTE':
      return {
        ...state,
        clientes: state.clientes.filter(c => c.id !== action.payload),
      };
    case 'SET_ESTADISTICAS':
      return {
        ...state,
        estadisticas: action.payload,
      };
    case 'SET_LOADED':
      return {
        ...state,
        isLoaded: {
          ...state.isLoaded,
          [action.payload.key]: action.payload.value,
        },
      };
    case 'SET_LAST_FETCH':
      return {
        ...state,
        lastFetch: {
          ...state.lastFetch,
          [action.payload.key]: action.payload.value,
        },
      };
    case 'CLEAR_CACHE':
      return initialState;
    default:
      return state;
  }
}

interface CacheContextType {
  state: CacheState;
  loadRecortes: (force?: boolean) => Promise<void>;
  loadMaquinas: (force?: boolean) => Promise<void>;
  loadClientes: (force?: boolean) => Promise<void>;
  loadEstadisticas: (force?: boolean) => Promise<void>;
  clearCache: () => void;
  isDataStale: (key: keyof CacheState['lastFetch'], maxAge?: number) => boolean;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

// Tiempo de caché por defecto: 5 minutos
const DEFAULT_CACHE_TIME = 5 * 60 * 1000;

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cacheReducer, initialState);
  const { socket, isConnected } = useSocket();

  // Función para verificar si los datos están obsoletos
  const isDataStale = useCallback((key: keyof CacheState['lastFetch'], maxAge = DEFAULT_CACHE_TIME) => {
    const lastFetch = state.lastFetch[key];
    if (!lastFetch) return true;
    return Date.now() - lastFetch > maxAge;
  }, [state.lastFetch]);

  // Cargar recortes usando el endpoint optimizado
  const loadRecortes = useCallback(async (force = false) => {
    if (!force && state.isLoaded.recortes && !isDataStale('recortes')) {
      return; // Usar caché
    }

    try {
      // Usar el endpoint principal que incluye todos los recortes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(`${config.API_BASE_URL}/api/recortes`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      dispatch({ type: 'SET_RECORTES', payload: data });
      dispatch({ type: 'SET_LOADED', payload: { key: 'recortes', value: true } });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'recortes', value: Date.now() } });
    } catch (error) {
      console.error('Error cargando recortes:', error);
      // Solo marcar como no cargado si no hay datos previos
      if (state.recortes.length === 0) {
        dispatch({ type: 'SET_LOADED', payload: { key: 'recortes', value: false } });
      }
    }
  }, []);

  // Cargar máquinas
  const loadMaquinas = useCallback(async (force = false) => {
    if (!force && state.isLoaded.maquinas && !isDataStale('maquinas')) {
      return; // Usar caché
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(`${config.API_BASE_URL}/api/maquinas`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      dispatch({ type: 'SET_MAQUINAS', payload: data });
      dispatch({ type: 'SET_LOADED', payload: { key: 'maquinas', value: true } });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'maquinas', value: Date.now() } });
    } catch (error) {
      console.error('Error cargando máquinas:', error);
      // Solo marcar como no cargado si no hay datos previos
      if (state.maquinas.length === 0) {
        dispatch({ type: 'SET_LOADED', payload: { key: 'maquinas', value: false } });
      }
    }
  }, []);

  // Cargar clientes
  const loadClientes = useCallback(async (force = false) => {
    if (!force && state.isLoaded.clientes && !isDataStale('clientes')) {
      return; // Usar caché
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(`${config.API_BASE_URL}/api/clientes`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      dispatch({ type: 'SET_CLIENTES', payload: data });
      dispatch({ type: 'SET_LOADED', payload: { key: 'clientes', value: true } });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'clientes', value: Date.now() } });
    } catch (error) {
      console.error('Error cargando clientes:', error);
      // Solo marcar como no cargado si no hay datos previos
      if (state.clientes.length === 0) {
        dispatch({ type: 'SET_LOADED', payload: { key: 'clientes', value: false } });
      }
    }
  }, []);

  // Cargar estadísticas en tiempo real
  const loadEstadisticas = useCallback(async (force = false) => {
    if (!force && state.isLoaded.estadisticas && !isDataStale('estadisticas')) {
      return; // Usar caché
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(`${config.API_BASE_URL}/api/estadisticas/tiempo-real`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      dispatch({ type: 'SET_ESTADISTICAS', payload: data });
      dispatch({ type: 'SET_LOADED', payload: { key: 'estadisticas', value: true } });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'estadisticas', value: Date.now() } });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      // Solo marcar como no cargado si no hay datos previos
      if (!state.estadisticas) {
        dispatch({ type: 'SET_LOADED', payload: { key: 'estadisticas', value: false } });
      }
    }
  }, []);

  // Limpiar caché
  const clearCache = useCallback(() => {
    dispatch({ type: 'CLEAR_CACHE' });
  }, []);

  // Cargar datos iniciales cuando se conecta y recargar cuando se reconecta
  useEffect(() => {
    if (isConnected) {
      // Si es una reconexión, forzar recarga para sincronizar
      const shouldForceReload = state.lastFetch.recortes !== null;
      
      loadRecortes(shouldForceReload);
      loadMaquinas(shouldForceReload);
      loadClientes(shouldForceReload);
      loadEstadisticas(shouldForceReload);
    }
  }, [isConnected]);

  // Manejar eventos de socket para mantener sincronización en tiempo real
  useEffect(() => {
    if (!socket) return;

    // Eventos de recortes
    socket.on('initialRecortes', (data: Recorte[]) => {
      dispatch({ type: 'SET_RECORTES', payload: data });
      dispatch({ type: 'SET_LOADED', payload: { key: 'recortes', value: true } });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'recortes', value: Date.now() } });
    });

    // Algunos backends envían los utilizados por separado
    socket.on('initialRecortesUtilizados', (data: Recorte[]) => {
      dispatch({ type: 'MERGE_RECORTES', payload: data });
      dispatch({ type: 'SET_LOADED', payload: { key: 'recortes', value: true } });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'recortes', value: Date.now() } });
    });

    socket.on('newRecorte', (recorte: Recorte) => {
      dispatch({ type: 'ADD_RECORTE', payload: recorte });
    });

    socket.on('recorteUpdated', (recorte: Recorte) => {
      dispatch({ type: 'UPDATE_RECORTE', payload: recorte });
    });

    socket.on('recorteUtilizado', (recorte: Recorte) => {
      dispatch({ type: 'UPDATE_RECORTE', payload: recorte });
    });

    socket.on('recorteDisponibleUpdated', (recorte: Recorte) => {
      dispatch({ type: 'UPDATE_RECORTE', payload: recorte });
    });

    // Manejar solicitudes de recarga desde el servidor
    socket.on('forceReload', () => {
      loadRecortes(true);
      loadMaquinas(true);
      loadClientes(true);
      loadEstadisticas(true);
    });

    // Actualizar estadísticas cuando cambian los recortes
    socket.on('newRecorte', () => {
      loadEstadisticas(true);
    });

    socket.on('recorteUpdated', () => {
      loadEstadisticas(true);
    });

    socket.on('recorteUtilizado', () => {
      loadEstadisticas(true);
    });

    socket.on('recorteDeleted', () => {
      loadEstadisticas(true);
    });

    socket.on('recorteDeleted', (id: string) => {
      dispatch({ type: 'DELETE_RECORTE', payload: id });
    });

    // Eventos de máquinas
    socket.on('initialMaquinas', (data: Maquina[]) => {
      dispatch({ type: 'SET_MAQUINAS', payload: data });
      dispatch({ type: 'SET_LOADED', payload: { key: 'maquinas', value: true } });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'maquinas', value: Date.now() } });
    });

    // Eventos de clientes
    socket.on('newCliente', (cliente: Cliente) => {
      dispatch({ type: 'ADD_CLIENTE', payload: cliente });
    });

    socket.on('clienteUpdated', (cliente: Cliente) => {
      dispatch({ type: 'UPDATE_CLIENTE', payload: cliente });
    });

    socket.on('materialUpdated', (cliente: Cliente) => {
      dispatch({ type: 'UPDATE_CLIENTE', payload: cliente });
    });

    socket.on('clienteDeleted', (id: string) => {
      dispatch({ type: 'DELETE_CLIENTE', payload: id });
    });

    return () => {
      socket.off('initialRecortes');
      socket.off('initialRecortesUtilizados');
      socket.off('newRecorte');
      socket.off('recorteUpdated');
      socket.off('recorteUtilizado');
      socket.off('recorteDisponibleUpdated');
      socket.off('recorteDeleted');
      socket.off('initialMaquinas');
      socket.off('newCliente');
      socket.off('clienteUpdated');
      socket.off('materialUpdated');
      socket.off('clienteDeleted');
      socket.off('forceReload');
    };
  }, [socket]);

  const value: CacheContextType = {
    state,
    loadRecortes,
    loadMaquinas,
    loadClientes,
    loadEstadisticas,
    clearCache,
    isDataStale,
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
}

// Hook personalizado que combina caché y socket data
export function useCachedSocketData() {
  const { state, loadRecortes, loadMaquinas, loadClientes, loadEstadisticas } = useCache();
  const { socket, isConnected } = useSocket();

  // Funciones de conveniencia (estado=true => disponible, estado=false => utilizado)
  const recortesDisponibles = state.recortes.filter(r => r.estado);
  const recortesUtilizados = state.recortes.filter(r => !r.estado);
  
  // Usar estadísticas de la API para datos más precisos
  const recortesUtilizadosCount = state.estadisticas?.resumen.recortesUtilizados || recortesUtilizados.length;
  const recortesUtilizadosUltimoMes = recortesUtilizados.filter(r => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return new Date(r.fecha_actualizacion) > oneMonthAgo;
  });

  const porcentajeRecortesPorMaquina = (() => {
    const totalDisponibles = recortesDisponibles.length;
    if (totalDisponibles === 0) return {};
    
    const recortesPorMaquina: Record<string, number> = {};
    state.maquinas.forEach(maquina => {
      const cantidad = recortesDisponibles.filter(r => r.maquinaId === maquina.id).length;
      recortesPorMaquina[maquina.id] = Math.round((cantidad / totalDisponibles) * 100);
    });
    
    return recortesPorMaquina;
  })();

  return {
    status: isConnected ? "🟢" : "🔴",
    recortes: state.recortes,
    recortesUtilizados,
    recortesUtilizadosCount,
    maquinas: state.maquinas,
    clientes: state.clientes,
    recortesDisponibles,
    recortesUtilizadosUltimoMes,
    porcentajeRecortesPorMaquina,
    estadisticas: state.estadisticas,
    isLoaded: state.isLoaded,
    loadRecortes,
    loadMaquinas,
    loadClientes,
    loadEstadisticas,
    socket,
    isConnected,
  };
}