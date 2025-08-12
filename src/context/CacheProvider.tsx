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

interface CacheState {
  recortes: Recorte[];
  recortesUtilizados: Recorte[];
  maquinas: Maquina[];
  clientes: Cliente[];
  isLoaded: {
    recortes: boolean;
    maquinas: boolean;
    clientes: boolean;
  };
  lastFetch: {
    recortes: number | null;
    maquinas: number | null;
    clientes: number | null;
  };
}

type CacheAction =
  | { type: 'SET_RECORTES'; payload: Recorte[] }
  | { type: 'ADD_RECORTE'; payload: Recorte }
  | { type: 'UPDATE_RECORTE'; payload: Recorte }
  | { type: 'DELETE_RECORTE'; payload: string }
  | { type: 'SET_MAQUINAS'; payload: Maquina[] }
  | { type: 'SET_CLIENTES'; payload: Cliente[] }
  | { type: 'ADD_CLIENTE'; payload: Cliente }
  | { type: 'UPDATE_CLIENTE'; payload: Cliente }
  | { type: 'DELETE_CLIENTE'; payload: string }
  | { type: 'SET_LOADED'; payload: { key: keyof CacheState['isLoaded']; value: boolean } }
  | { type: 'SET_LAST_FETCH'; payload: { key: keyof CacheState['lastFetch']; value: number } }
  | { type: 'CLEAR_CACHE' };

const initialState: CacheState = {
  recortes: [],
  recortesUtilizados: [],
  maquinas: [],
  clientes: [],
  isLoaded: {
    recortes: false,
    maquinas: false,
    clientes: false,
  },
  lastFetch: {
    recortes: null,
    maquinas: null,
    clientes: null,
  },
};

function cacheReducer(state: CacheState, action: CacheAction): CacheState {
  switch (action.type) {
    case 'SET_RECORTES':
      const recortesUtilizados = action.payload.filter(r => !r.estado);
      return {
        ...state,
        recortes: action.payload,
        recortesUtilizados,
      };
    case 'ADD_RECORTE':
      const newRecortes = [action.payload, ...state.recortes];
      return {
        ...state,
        recortes: newRecortes,
        recortesUtilizados: !action.payload.estado 
          ? [action.payload, ...state.recortesUtilizados]
          : state.recortesUtilizados,
      };
    case 'UPDATE_RECORTE':
      const updatedRecortes = state.recortes.map(r => 
        r.id === action.payload.id ? action.payload : r
      );
      const updatedRecortesUtilizados = action.payload.estado
        ? state.recortesUtilizados.filter(r => r.id !== action.payload.id)
        : state.recortesUtilizados.some(r => r.id === action.payload.id)
          ? state.recortesUtilizados.map(r => r.id === action.payload.id ? action.payload : r)
          : [action.payload, ...state.recortesUtilizados];
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

  // Cargar recortes
  const loadRecortes = useCallback(async (force = false) => {
    if (!force && state.isLoaded.recortes && !isDataStale('recortes')) {
      return; // Usar caché
    }

    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const dateParam = sixMonthsAgo.toISOString();
      
      const response = await fetch(`${config.API_BASE_URL}/api/recortes?since=${dateParam}`);
      const data = await response.json();
      
      dispatch({ type: 'SET_RECORTES', payload: data });
      dispatch({ type: 'SET_LOADED', payload: { key: 'recortes', value: true } });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'recortes', value: Date.now() } });
    } catch (error) {
      console.error('Error cargando recortes:', error);
    }
  }, [state.isLoaded.recortes, isDataStale]);

  // Cargar máquinas
  const loadMaquinas = useCallback(async (force = false) => {
    if (!force && state.isLoaded.maquinas && !isDataStale('maquinas')) {
      return; // Usar caché
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/maquinas`);
      const data = await response.json();
      
      dispatch({ type: 'SET_MAQUINAS', payload: data });
      dispatch({ type: 'SET_LOADED', payload: { key: 'maquinas', value: true } });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'maquinas', value: Date.now() } });
    } catch (error) {
      console.error('Error cargando máquinas:', error);
    }
  }, [state.isLoaded.maquinas, isDataStale]);

  // Cargar clientes
  const loadClientes = useCallback(async (force = false) => {
    if (!force && state.isLoaded.clientes && !isDataStale('clientes')) {
      return; // Usar caché
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/clientes`);
      const data = await response.json();
      
      dispatch({ type: 'SET_CLIENTES', payload: data });
      dispatch({ type: 'SET_LOADED', payload: { key: 'clientes', value: true } });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'clientes', value: Date.now() } });
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  }, [state.isLoaded.clientes, isDataStale]);

  // Limpiar caché
  const clearCache = useCallback(() => {
    dispatch({ type: 'CLEAR_CACHE' });
  }, []);

  // Cargar datos iniciales cuando se conecta
  useEffect(() => {
    if (isConnected) {
      loadRecortes();
      loadMaquinas();
      loadClientes();
    }
  }, [isConnected, loadRecortes, loadMaquinas, loadClientes]);

  // Manejar eventos de socket para mantener sincronización en tiempo real
  useEffect(() => {
    if (!socket) return;

    // Eventos de recortes
    socket.on('initialRecortes', (data: Recorte[]) => {
      dispatch({ type: 'SET_RECORTES', payload: data });
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
      socket.off('newRecorte');
      socket.off('recorteUpdated');
      socket.off('recorteUtilizado');
      socket.off('recorteDeleted');
      socket.off('initialMaquinas');
      socket.off('newCliente');
      socket.off('clienteUpdated');
      socket.off('materialUpdated');
      socket.off('clienteDeleted');
    };
  }, [socket]);

  const value: CacheContextType = {
    state,
    loadRecortes,
    loadMaquinas,
    loadClientes,
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
  const { state, loadRecortes, loadMaquinas, loadClientes } = useCache();
  const { socket, isConnected } = useSocket();

  // Funciones de conveniencia
  const recortesDisponibles = state.recortes.filter(r => r.estado);
  const recortesUtilizadosUltimoMes = state.recortesUtilizados.filter(r => {
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
    recortesUtilizados: state.recortesUtilizados,
    maquinas: state.maquinas,
    clientes: state.clientes,
    recortesDisponibles,
    recortesUtilizadosUltimoMes,
    porcentajeRecortesPorMaquina,
    isLoaded: state.isLoaded,
    loadRecortes,
    loadMaquinas,
    loadClientes,
    socket,
    isConnected,
  };
}