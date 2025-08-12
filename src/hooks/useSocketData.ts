import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSocket } from '@/context/SocketProvider';
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

// Hook para gestionar los datos de socket de manera optimizada
export function useSocketData() {
  const { socket, isConnected } = useSocket();
  const [recortes, setRecortes] = useState<Recorte[]>([]);
  const [recortesUtilizados, setRecortesUtilizados] = useState<Recorte[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [status, setStatus] = useState<string>("🔴");
  const [recorteUpdateCallback, setRecorteUpdateCallback] = useState<((recorte: Recorte) => void) | null>(null);

  // Reducer para manejar estados complejos con tipos explícitos
  const recortesReducer = useCallback((state: { recortes: Recorte[] }, action: { type: string; payload: any }) => {
    switch (action.type) {
      case 'SET_RECORTES':
        return { ...state, recortes: action.payload };
      case 'ADD_RECORTE':
        return { ...state, recortes: [action.payload, ...state.recortes] };
      case 'DELETE_RECORTE':
        return { ...state, recortes: state.recortes.filter((r: Recorte) => r.id !== action.payload) };
      case 'UPDATE_RECORTE':
        return {
          ...state,
          recortes: state.recortes.map((r: Recorte) => r.id === action.payload.id ? action.payload : r),
        };
      default:
        return state;
    }
  }, []);

  // Implementación de batching para evitar múltiples renders con tipos explícitos
  const batchUpdates = useCallback((updates: { type: string; payload: any }[]) => {
    updates.forEach((update: { type: string; payload: any }) => {
      switch (update.type) {
        case 'ADD_RECORTE':
          setRecortes(prev => [update.payload, ...prev]);
          break;
        case 'DELETE_RECORTE':
          setRecortes(prev => prev.filter((r: Recorte) => r.id !== update.payload));
          break;
        case 'UPDATE_RECORTE':
          setRecortes(prev => prev.map((r: Recorte) => r.id === update.payload.id ? update.payload : r));
          break;
        default:
          break;
      }
    });
  }, []);

  // Cargar datos iniciales de forma memoizada
  const loadInitialData = useCallback(async () => {
    try {
      // Cargar recortes optimizado para los últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const dateParam = sixMonthsAgo.toISOString();
      
      const recortesResponse = await fetch(`${config.API_BASE_URL}/api/recortes?since=${dateParam}`);
      const recortesData = await recortesResponse.json();
      setRecortes(recortesData);

      // Cargar máquinas
      const maquinasResponse = await fetch(`${config.API_BASE_URL}/api/maquinas`);
      const maquinasData = await maquinasResponse.json();
      setMaquinas(maquinasData);

      // Cargar clientes
      const clientesResponse = await fetch(`${config.API_BASE_URL}/api/clientes`);
      const clientesData = await clientesResponse.json();
      setClientes(clientesData);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  }, []);

  // Manejar eventos de socket
  useEffect(() => {
    if (!socket) return;
    
    // Actualizar estado de conexión
    setStatus(isConnected ? "🟢" : "🔴");
    
    // Cargar datos iniciales cuando nos conectamos
    if (isConnected) {
      loadInitialData();
    }

    // Eventos de recortes
    socket.on('initialRecortes', (data: Recorte[]) => {
      setRecortes(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const merged = [...prev, ...data.filter(r => !existingIds.has(r.id))];
        return merged;
      });
    });
    socket.on('initialRecortesUtilizados', (data: Recorte[]) => {
      setRecortesUtilizados(data);
      setRecortes(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const merged = [...prev, ...data.filter(r => !existingIds.has(r.id))];
        return merged;
      });
    });
    
    socket.on('newRecorte', (recorte: Recorte) => {
      setRecortes(prev => [recorte, ...prev]);
    });
    
    socket.on('recorteDeleted', (id: string) => {
      setRecortes(prev => prev.filter(recorte => recorte.id !== id));
      setRecortesUtilizados(prev => prev.filter(recorte => recorte.id !== id));
    });
    
    socket.on('recorteUpdated', (recorte: Recorte) => {
      // Actualizar/insertar en la lista principal
      setRecortes(prev => prev.some(r => r.id === recorte.id)
        ? prev.map(r => (r.id === recorte.id ? recorte : r))
        : [recorte, ...prev]
      );
      // Mantener lista auxiliar de utilizados sincronizada
      if (recorte.estado) {
        setRecortesUtilizados(prev => prev.filter(r => r.id !== recorte.id));
      } else {
        setRecortesUtilizados(prev => (prev.some(r => r.id === recorte.id)
          ? prev.map(r => (r.id === recorte.id ? recorte : r))
          : [recorte, ...prev]));
      }
      if (recorteUpdateCallback) {
        recorteUpdateCallback(recorte);
      }
    });

    socket.on('recorteUtilizado', (recorte: Recorte) => {
      // Asegurar que quede en la lista principal con estado actualizado y en utilizados
      setRecortes(prev => prev.some(r => r.id === recorte.id)
        ? prev.map(r => (r.id === recorte.id ? recorte : r))
        : [recorte, ...prev]
      );
      setRecortesUtilizados(prev => (prev.some(r => r.id === recorte.id)
        ? prev.map(r => (r.id === recorte.id ? recorte : r))
        : [recorte, ...prev]
      ));
    });

    // Eventos de máquinas
    socket.on('initialMaquinas', (data: Maquina[]) => {
      setMaquinas(data);
    });

    // Eventos de clientes
    socket.on('newCliente', (cliente: Cliente) => {
      setClientes(prev => [cliente, ...prev]);
    });
    
    socket.on('clienteDeleted', (id: string) => {
      setClientes(prev => prev.filter(cliente => cliente.id !== id));
    });
    
    socket.on('clienteUpdated', (cliente: Cliente) => {
      setClientes(prev => prev.map(c => c.id === cliente.id ? cliente : c));
    });
    
    socket.on("materialUpdated", (cliente: Cliente) => {
      setClientes(prev => prev.map(c => c.id === cliente.id ? cliente : c));
    });

    // Limpieza al desmontar
    return () => {
      if (!socket) return;
      socket.off('initialRecortes');
      socket.off('newRecorte');
      socket.off('recorteDeleted');
      socket.off('recorteUpdated');
      socket.off('recorteUtilizado');
      socket.off('initialRecortesUtilizados');
      socket.off('initialMaquinas');
      socket.off('newCliente');
      socket.off('clienteDeleted');
      socket.off('clienteUpdated');
      socket.off('materialUpdated');
    };
  }, [socket, isConnected, loadInitialData, recorteUpdateCallback]);

  // Filtrar recortes disponibles (memoizado para evitar recálculos)
  const recortesDisponibles = useMemo(() => {
    return recortes.filter(r => r.estado);
  }, [recortes]);

  // Filtrar recortes utilizados del último mes (memoizado)
  const recortesUtilizadosUltimoMes = useMemo(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return recortesUtilizados.filter(r => new Date(r.fecha_actualizacion) > oneMonthAgo);
  }, [recortesUtilizados]);

  // Calcular el porcentaje de recortes por máquina (memoizado)
  const porcentajeRecortesPorMaquina = useMemo(() => {
    const totalDisponibles = recortesDisponibles.length;
    if (totalDisponibles === 0) return {};
    
    const recortesPorMaquina: Record<string, number> = {};
    maquinas.forEach(maquina => {
      const cantidad = recortesDisponibles.filter(r => r.maquinaId === maquina.id).length;
      recortesPorMaquina[maquina.id] = Math.round((cantidad / totalDisponibles) * 100);
    });
    
    return recortesPorMaquina;
  }, [recortesDisponibles, maquinas]);

  return {
    status,
    recortes,
    recortesUtilizados,
    maquinas,
    clientes,
    recortesDisponibles,
    recortesUtilizadosUltimoMes,
    porcentajeRecortesPorMaquina,
    setRecorteUpdateCallback
  };
}
