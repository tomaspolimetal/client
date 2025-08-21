# Sistema de Caché Inteligente

## 📋 Descripción

Se ha implementado un sistema de caché inteligente que evita la recarga constante de datos al navegar entre páginas, manteniendo la sincronización en tiempo real a través de sockets.

## 🚀 Características

- ✅ **Caché en memoria**: Los datos se almacenan en memoria durante la sesión
- ✅ **Sincronización en tiempo real**: Los sockets actualizan el caché automáticamente
- ✅ **Gestión de obsolescencia**: Detecta cuando los datos necesitan actualizarse
- ✅ **Indicador visual**: Muestra el estado del caché en la interfaz
- ✅ **Compatibilidad**: Mantiene la interfaz existente de `useSocketData`

## 🏗️ Arquitectura

### CacheProvider

Contexto principal que gestiona el estado del caché:

```typescript
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
```

### Hooks Disponibles

#### `useCachedSocketData()`
Hook principal recomendado para nuevos componentes:

```typescript
const {
  status,
  recortes,
  maquinas,
  clientes,
  recortesDisponibles,
  isLoaded,
  loadRecortes,
  loadMaquinas,
  loadClientes
} = useCachedSocketData();
```

#### `useSocketData()` (Compatibilidad)
Mantiene la interfaz original para componentes existentes:

```typescript
const {
  status,
  recortes,
  maquinas,
  clientes,
  setRecorteUpdateCallback
} = useSocketData();
```

## 🔧 Configuración

### Tiempo de Caché

Por defecto, los datos se consideran válidos por **5 minutos**:

```typescript
const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutos
```

### Eventos de Socket Manejados

- `initialRecortes` - Carga inicial de recortes
- `newRecorte` - Nuevo recorte creado
- `recorteUpdated` - Recorte actualizado
- `recorteUtilizado` - Recorte marcado como utilizado
- `recorteDeleted` - Recorte eliminado
- `initialMaquinas` - Carga inicial de máquinas
- `newCliente` - Nuevo cliente creado
- `clienteUpdated` - Cliente actualizado
- `materialUpdated` - Material de cliente actualizado
- `clienteDeleted` - Cliente eliminado

## 📊 Indicador de Caché

El componente `CacheIndicator` muestra el estado del caché:

### Modo Compacto
```typescript
<CacheIndicator />
```

### Modo Detallado
```typescript
<CacheIndicator showDetails={true} />
```

### Estados del Indicador

- 🟢 **Verde**: Datos actualizados
- 🟡 **Amarillo**: Cargando datos
- 🟠 **Naranja**: Datos obsoletos

## 🔄 Flujo de Datos

1. **Carga Inicial**: Al conectarse, se cargan los datos si no están en caché
2. **Navegación**: Al cambiar de página, se usan los datos del caché
3. **Actualización en Tiempo Real**: Los sockets actualizan el caché automáticamente
4. **Detección de Obsolescencia**: Se verifica si los datos necesitan actualizarse
5. **Recarga Inteligente**: Solo se recargan los datos obsoletos

## 📈 Beneficios

### Rendimiento
- ⚡ **Navegación instantánea**: No hay recargas al cambiar de página
- 🔄 **Menos peticiones HTTP**: Solo se cargan datos cuando es necesario
- 💾 **Uso eficiente de memoria**: Gestión inteligente del estado

### Experiencia de Usuario
- 🚀 **Interfaz más fluida**: Transiciones sin esperas
- 📊 **Feedback visual**: Indicador del estado del caché
- 🔄 **Datos siempre actualizados**: Sincronización en tiempo real

## 🛠️ Migración

### Para Componentes Existentes

No se requieren cambios, el hook `useSocketData` mantiene compatibilidad:

```typescript
// Antes y después - sin cambios
const { status, recortes, maquinas } = useSocketData();
```

### Para Nuevos Componentes

Usar el hook optimizado:

```typescript
// Recomendado para nuevos componentes
const { status, recortes, maquinas } = useCachedSocketData();
```

## 🔍 Debugging

### Verificar Estado del Caché

```typescript
const { state, isDataStale } = useCache();
console.log('Estado del caché:', state);
console.log('¿Datos obsoletos?', isDataStale('recortes'));
```

### Limpiar Caché Manualmente

```typescript
const { clearCache } = useCache();
clearCache(); // Limpia todo el caché
```

### Forzar Recarga

```typescript
const { loadRecortes } = useCache();
loadRecortes(true); // force = true
```

## 📝 Notas Técnicas

- El caché se almacena en memoria y se pierde al recargar la página
- Los datos se sincronizan automáticamente con los eventos de socket
- El sistema es retrocompatible con el código existente
- Se puede extender fácilmente para nuevos tipos de datos

## 🔧 Mejoras Implementadas (Agosto 2025)

### ✅ Problemas Resueltos
- **Reconexión automática mejorada**: Configuración robusta de Socket.IO con reintentos automáticos
- **Sincronización tras reconexión**: Recarga automática de datos cuando se restablece la conexión
- **Manejo de errores HTTP**: Validación de respuestas y manejo de errores de red
- **Eventos de socket adicionales**: Soporte para `recorteDisponibleUpdated` y `forceReload`
- **Indicador visual mejorado**: Estado de conexión y botones de reconexión manual
- **Invalidación de caché inteligente**: Marcado de datos como no cargados en caso de error

### 🚀 Nuevas Características
- **RecortesService**: Servicio optimizado que usa los nuevos endpoints paginados
- **Cache de segundo nivel**: Cache adicional en el servicio para consultas frecuentes
- **Compatibilidad mejorada**: Hook `useSocketData` que mantiene la interfaz original
- **Limpieza automática**: Limpieza periódica de cache expirado
- **Feedback visual**: Toasts informativos para operaciones de cache

### 📊 Endpoints Optimizados Utilizados
- `/api/recortes/maquina/{id}/pendientes` - Recortes pendientes paginados
- `/api/recortes/maquina/{id}/estado/{estado}` - Recortes por estado paginados
- `/api/estadisticas/tiempo-real` - Estadísticas en tiempo real
- `/api/estadisticas/maquina/{id}` - Estadísticas por máquina
- `/api/estadisticas/resumen` - Resumen general de estadísticas

## 🔮 Futuras Mejoras

- [ ] Persistencia en localStorage para datos no sensibles
- [ ] Configuración de tiempo de caché por tipo de dato
- [ ] Métricas de rendimiento del caché
- [ ] Prefetching inteligente de datos relacionados
- [ ] Compresión de datos en cache
- [ ] Sincronización offline/online