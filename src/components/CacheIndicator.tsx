'use client'
import { useCache } from '@/context/CacheProvider';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RefreshCw, Database, Clock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface CacheIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export function CacheIndicator({ showDetails = false, className = '' }: CacheIndicatorProps) {
  const { state, clearCache, isDataStale, loadRecortes, loadMaquinas, loadClientes } = useCache();

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
    const recortesStale = isDataStale('recortes');
    const maquinasStale = isDataStale('maquinas');
    const clientesStale = isDataStale('clientes');
    
    if (!state.isLoaded.recortes && !state.isLoaded.maquinas && !state.isLoaded.clientes) {
      return { status: 'loading', color: 'yellow', text: 'Cargando...' };
    }
    
    if (recortesStale || maquinasStale || clientesStale) {
      return { status: 'stale', color: 'orange', text: 'Datos obsoletos' };
    }
    
    return { status: 'fresh', color: 'green', text: 'Datos actualizados' };
  };

  const handleRefreshAll = async () => {
    await Promise.all([
      loadRecortes(true),
      loadMaquinas(true),
      loadClientes(true)
    ]);
  };

  const cacheStatus = getCacheStatus();

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={cacheStatus.color === 'green' ? 'default' : 'secondary'}
              className={`cursor-help ${className}`}
            >
              <Database className="w-3 h-3 mr-1" />
              {cacheStatus.text}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p><strong>Estado del Caché:</strong></p>
              <p>Recortes: {state.isLoaded.recortes ? '✅' : '⏳'} {formatLastFetch(state.lastFetch.recortes)}</p>
              <p>Máquinas: {state.isLoaded.maquinas ? '✅' : '⏳'} {formatLastFetch(state.lastFetch.maquinas)}</p>
              <p>Clientes: {state.isLoaded.clientes ? '✅' : '⏳'} {formatLastFetch(state.lastFetch.clientes)}</p>
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="h-7 px-2"
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