'use client'
import { useCache } from '@/context/CacheProvider';
import { useSocket } from '@/context/SocketProvider';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RefreshCw, Database, Clock, Wifi, WifiOff } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { useToast } from './ui/use-toast';

interface CacheIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export function CacheIndicator({ showDetails = false, className = '' }: CacheIndicatorProps) {
  const { state, clearCache, isDataStale, loadRecortes, loadMaquinas, loadClientes } = useCache();
  const { isConnected, forceReconnect } = useSocket();
  const { toast } = useToast();

  const formatLastFetch = (timestamp: number | null) => {
    if (!timestamp) return 'Nunca';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `Hace ${minutes}m ${seconds}s`;
    }
    return `Hace ${seconds}s`;
  };

  const getCacheStatus = () => {
    if (!isConnected) {
      return { status: 'disconnected', color: 'red', text: 'Desconectado' };
    }
    
    const recortesStale = isDataStale('recortes');
    const maquinasStale = isDataStale('maquinas');
    const clientesStale = isDataStale('clientes');
    
    if (!state.isLoaded.recortes && !state.isLoaded.maquinas && !state.isLoaded.clientes) {
      return { status: 'loading', color: 'yellow', text: 'Cargando...' };
    }
    
    if (recortesStale || maquinasStale || clientesStale) {
      return { status: 'stale', color: 'orange', text: 'Datos obsoletos' };
    }
    
    return { status: 'fresh', color: 'green', text: 'Actualizado' };
  };

  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        loadRecortes(true),
        loadMaquinas(true),
        loadClientes(true)
      ]);
      toast({
        title: "Datos actualizados",
        description: "El caché ha sido actualizado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al actualizar",
        description: "No se pudieron actualizar los datos. Verifica tu conexión.",
        variant: "destructive",
      });
    }
  };

  const handleForceReconnect = () => {
    forceReconnect();
    toast({
      title: "Reconectando...",
      description: "Intentando reconectar al servidor.",
    });
  };

  const cacheStatus = getCacheStatus();

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={cacheStatus.color === 'green' ? 'default' : 'secondary'}
              className={`cursor-help ${className} ${!isConnected ? 'cursor-pointer hover:bg-red-100' : ''}`}
              onClick={!isConnected ? handleForceReconnect : undefined}
            >
              {isConnected ? (
                <Database className="w-3 h-3 mr-1" />
              ) : (
                <WifiOff className="w-3 h-3 mr-1" />
              )}
              {cacheStatus.text}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                {isConnected ? <Wifi className="w-3 h-3 text-green-500" /> : <WifiOff className="w-3 h-3 text-red-500" />}
                <span><strong>Conexión:</strong> {isConnected ? 'Conectado' : 'Desconectado'}</span>
              </div>
              <p><strong>Estado del Caché:</strong></p>
              <p>Recortes: {state.isLoaded.recortes ? '✅' : '⏳'} {formatLastFetch(state.lastFetch.recortes)}</p>
              <p>Máquinas: {state.isLoaded.maquinas ? '✅' : '⏳'} {formatLastFetch(state.lastFetch.maquinas)}</p>
              <p>Clientes: {state.isLoaded.clientes ? '✅' : '⏳'} {formatLastFetch(state.lastFetch.clientes)}</p>
              {!isConnected && (
                <p className="text-xs text-red-500 mt-2">Click para reconectar</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4" />
          <span className="text-sm font-medium">Estado del Caché</span>
          <Badge variant={cacheStatus.color === 'green' ? 'default' : 'secondary'}>
            {cacheStatus.text}
          </Badge>
        </div>
        <div className="flex space-x-1">
          {!isConnected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceReconnect}
              className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <WifiOff className="w-3 h-3 mr-1" />
              Reconectar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="h-7 px-2"
            disabled={!isConnected}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCache}
            className="h-7 px-2"
          >
            Limpiar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center space-x-1">
          <span className={state.isLoaded.recortes ? 'text-green-600' : 'text-gray-400'}>●</span>
          <span>Recortes</span>
          <Clock className="w-3 h-3" />
          <span className="text-gray-500">{formatLastFetch(state.lastFetch.recortes)}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className={state.isLoaded.maquinas ? 'text-green-600' : 'text-gray-400'}>●</span>
          <span>Máquinas</span>
          <Clock className="w-3 h-3" />
          <span className="text-gray-500">{formatLastFetch(state.lastFetch.maquinas)}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className={state.isLoaded.clientes ? 'text-green-600' : 'text-gray-400'}>●</span>
          <span>Clientes</span>
          <Clock className="w-3 h-3" />
          <span className="text-gray-500">{formatLastFetch(state.lastFetch.clientes)}</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        <p>Total en caché: {state.recortes.length} recortes, {state.maquinas.length} máquinas, {state.clientes.length} clientes</p>
      </div>
    </div>
  );
}