import config from '@/config/config';

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: T[];
}

export interface RecorteWithMaquina {
  id: string;
  maquinaId: string;
  estado: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  largo: number;
  ancho: number;
  espesor: number;
  cantidad: number;
  observaciones: string;
  imagen: string;
  maquina_nombre: string;
}

export class RecortesService {
  private static baseUrl = config.API_BASE_URL;

  /**
   * Obtiene recortes pendientes por máquina usando el endpoint optimizado
   */
  static async getRecortesPendientesByMaquina(
    maquinaId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<RecorteWithMaquina>> {
    const response = await fetch(
      `${this.baseUrl}/api/recortes/maquina/${maquinaId}/pendientes?page=${page}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * Obtiene recortes por máquina y estado usando el endpoint optimizado
   */
  static async getRecortesByMaquinaAndEstado(
    maquinaId: string,
    estado: boolean,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<RecorteWithMaquina>> {
    const response = await fetch(
      `${this.baseUrl}/api/recortes/maquina/${maquinaId}/estado/${estado}?page=${page}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * Obtiene estadísticas en tiempo real
   */
  static async getEstadisticasTiempoReal() {
    const response = await fetch(`${this.baseUrl}/api/estadisticas/tiempo-real`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * Obtiene estadísticas de una máquina específica
   */
  static async getEstadisticasMaquina(
    maquinaId: string,
    options?: {
      ultimoMes?: boolean;
      fechaInicio?: string;
      fechaFin?: string;
    }
  ) {
    const params = new URLSearchParams();
    if (options?.ultimoMes) params.append('ultimoMes', 'true');
    if (options?.fechaInicio) params.append('fechaInicio', options.fechaInicio);
    if (options?.fechaFin) params.append('fechaFin', options.fechaFin);

    const response = await fetch(
      `${this.baseUrl}/api/estadisticas/maquina/${maquinaId}?${params.toString()}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * Obtiene resumen de estadísticas
   */
  static async getResumenEstadisticas(options?: {
    ultimoMes?: boolean;
    fechaInicio?: string;
    fechaFin?: string;
  }) {
    const params = new URLSearchParams();
    if (options?.ultimoMes) params.append('ultimoMes', 'true');
    if (options?.fechaInicio) params.append('fechaInicio', options.fechaInicio);
    if (options?.fechaFin) params.append('fechaFin', options.fechaFin);

    const response = await fetch(
      `${this.baseUrl}/api/estadisticas/resumen?${params.toString()}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * Cache inteligente para recortes por máquina
   */
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static readonly DEFAULT_TTL = 2 * 60 * 1000; // 2 minutos

  static async getCachedRecortesByMaquina(
    maquinaId: string,
    estado: boolean,
    page: number = 1,
    limit: number = 10,
    ttl: number = this.DEFAULT_TTL
  ): Promise<PaginatedResponse<RecorteWithMaquina>> {
    const cacheKey = `recortes_${maquinaId}_${estado}_${page}_${limit}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    const data = await this.getRecortesByMaquinaAndEstado(maquinaId, estado, page, limit);
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });

    return data;
  }

  /**
   * Invalida cache específico
   */
  static invalidateCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Limpia cache expirado
   */
  static cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Limpiar cache expirado cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    RecortesService.cleanExpiredCache();
  }, 5 * 60 * 1000);
}
