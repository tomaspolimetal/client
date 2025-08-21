# 📚 Documentación Completa de la API - Recortes App

## 🌐 URL Base
```
https://backend-vkuq.onrender.com
```

## 📋 Índice
- [Clientes](#-clientes)
- [Máquinas](#-máquinas)
- [Recortes](#-recortes)
- [Recortes con Vistas Optimizadas](#-recortes-con-vistas-optimizadas)
- [Endpoints de Estadísticas](#-endpoints-de-estadísticas)
- [Eventos Socket.IO](#-eventos-socketio)
- [Códigos de Estado](#-códigos-de-estado)
- [Ejemplos de Respuesta](#-ejemplos-de-respuesta)

---

## 👥 Clientes

### Obtener todos los clientes
```http
GET https://backend-vkuq.onrender.com/api/clientes
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "nombre": "string",
    "estado": true,
    "createdAt": "2025-01-25T10:30:00.000Z",
    "updatedAt": "2025-01-25T10:30:00.000Z"
  }
]
```

### Crear nuevo cliente
```http
POST https://backend-vkuq.onrender.com/api/clientes
Content-Type: application/json

{
  "nombre": "Nombre del Cliente"
}
```

### Actualizar cliente
```http
PUT https://backend-vkuq.onrender.com/api/clientes/{id}
Content-Type: application/json

{
  "nombre": "Nuevo Nombre",
  "estado": false
}
```

### Eliminar cliente
```http
DELETE https://backend-vkuq.onrender.com/api/clientes/{id}
```

---

## 🏭 Máquinas

### Obtener todas las máquinas
```http
GET https://backend-vkuq.onrender.com/api/maquinas
```

**Respuesta:**
```json
[
  {
    "id": "6f7f5706-5323-4c57-9b1d-fd7c908a09ed",
    "nombre": "Laser 1",
    "createdAt": "2025-01-25T10:30:00.000Z",
    "updatedAt": "2025-01-25T10:30:00.000Z"
  },
  {
    "id": "8a2b3c4d-5e6f-7890-abcd-ef1234567890",
    "nombre": "Plasma",
    "createdAt": "2025-01-25T10:30:00.000Z",
    "updatedAt": "2025-01-25T10:30:00.000Z"
  }
]
```

### Crear nueva máquina
```http
POST https://backend-vkuq.onrender.com/api/maquinas
Content-Type: application/json

{
  "nombre": "Nombre de la Máquina"
}
```

### Actualizar máquina
```http
PUT https://backend-vkuq.onrender.com/api/maquinas/{id}
Content-Type: application/json

{
  "nombre": "Nuevo Nombre"
}
```

### Eliminar máquina
```http
DELETE https://backend-vkuq.onrender.com/api/maquinas/{id}
```

---

## 📐 Recortes

### Obtener todos los recortes
```http
GET https://backend-vkuq.onrender.com/api/recortes
```

**Respuesta:**
```json
[
  {
    "id": "a88a0b69-568e-46ac-8bb6-67e0b1a98db8",
    "largo": 100.5,
    "ancho": 50.2,
    "espesor": 3.0,
    "cantidad": 5,
    "estado": false,
    "fecha_creacion": "2025-01-25T10:30:00.000Z",
    "fecha_actualizacion": "2025-01-25T10:30:00.000Z",
    "maquinaId": "6f7f5706-5323-4c57-9b1d-fd7c908a09ed",
    "observaciones": "Corte especial",
    "imagen": "uploads/imagen.jpg"
  }
]
```

### Crear nuevo recorte
```http
POST https://backend-vkuq.onrender.com/api/recortes
Content-Type: multipart/form-data

largo=100.5
ancho=50.2
espesor=3.0
cantidad=5
maquinaId=6f7f5706-5323-4c57-9b1d-fd7c908a09ed
observaciones=Corte especial
imagen=@archivo.jpg
```

### Obtener recorte por ID
```http
GET https://backend-vkuq.onrender.com/api/recortes/{id}
```

### Actualizar recorte
```http
PUT https://backend-vkuq.onrender.com/api/recortes/{id}
Content-Type: multipart/form-data

largo=120.0
ancho=60.0
estado=true
```

### Eliminar recorte
```http
DELETE https://backend-vkuq.onrender.com/api/recortes/{id}
```

---

## 🚀 Recortes con Vistas Optimizadas

> **Nota:** Estos endpoints utilizan vistas de base de datos optimizadas para consultas rápidas y paginación eficiente.

### Obtener recortes pendientes por máquina (Paginado)
```http
GET https://backend-vkuq.onrender.com/api/recortes/maquina/{maquinaId}/pendientes?page=1&limit=10
```

**Parámetros de consulta:**
- `page` (opcional): Número de página (por defecto: 1)
- `limit` (opcional): Elementos por página (por defecto: 10, máximo: 100)

**Ejemplo:**
```http
GET https://backend-vkuq.onrender.com/api/recortes/maquina/6f7f5706-5323-4c57-9b1d-fd7c908a09ed/pendientes?page=1&limit=10
```

**Respuesta:**
```json
{
  "page": 1,
  "limit": 10,
  "total": 21,
  "totalPages": 3,
  "data": [
    {
      "id": "25151eef-71bb-4e7d-b8b1-b795f80e83fb",
      "maquinaId": "6f7f5706-5323-4c57-9b1d-fd7c908a09ed",
      "estado": false,
      "fecha_creacion": "2025-08-19T13:50:00.000Z",
      "fecha_actualizacion": "2025-08-19T13:50:00.000Z",
      "largo": 100.5,
      "ancho": 50.2,
      "espesor": 3.0,
      "cantidad": 5,
      "observaciones": "Corte pendiente",
      "imagen": "uploads/imagen.jpg",
      "maquina_nombre": "Laser 1"
    }
  ]
}
```

### Obtener recortes por máquina y estado (Paginado)
```http
GET https://backend-vkuq.onrender.com/api/recortes/maquina/{maquinaId}/estado/{estado}?page=1&limit=10
```

**Parámetros de ruta:**
- `maquinaId`: ID de la máquina
- `estado`: `true` (completados) o `false` (pendientes)

**Parámetros de consulta:**
- `page` (opcional): Número de página (por defecto: 1)
- `limit` (opcional): Elementos por página (por defecto: 10, máximo: 100)

**Ejemplos:**
```http
# Recortes pendientes
GET https://backend-vkuq.onrender.com/api/recortes/maquina/6f7f5706-5323-4c57-9b1d-fd7c908a09ed/estado/false?page=1&limit=5

# Recortes completados
GET https://backend-vkuq.onrender.com/api/recortes/maquina/6f7f5706-5323-4c57-9b1d-fd7c908a09ed/estado/true?page=1&limit=5
```

**Respuesta:**
```json
{
  "page": 1,
  "limit": 5,
  "total": 18,
  "totalPages": 4,
  "data": [
    {
      "id": "uuid",
      "maquinaId": "6f7f5706-5323-4c57-9b1d-fd7c908a09ed",
      "estado": true,
      "fecha_creacion": "2025-01-25T10:30:00.000Z",
      "fecha_actualizacion": "2025-01-25T11:45:00.000Z",
      "largo": 200.0,
      "ancho": 100.0,
      "espesor": 5.0,
      "cantidad": 3,
      "observaciones": "Completado exitosamente",
      "imagen": "uploads/completado.jpg",
      "maquina_nombre": "Laser 1"
    }
  ]
}
```

---

## 📊 Endpoints de Estadísticas

### GET /api/estadisticas/tiempo-real
Obtiene estadísticas en tiempo real para dashboard.

**Respuesta:**
```json
{
  "resumen": {
    "totalRecortes": 36,
    "recortesDisponibles": 11,
    "recortesUtilizados": 25,
    "porcentajeDisponibles": "30.56",
    "porcentajeUtilizados": "69.44"
  },
  "estadisticasPorMaquina": [
    {
      "maquina": {
        "id": "6f7f5706-5323-4c57-9b1d-fd7c908a09ed",
        "nombre": "Laser 1"
      },
      "totalRecortes": 15,
      "disponibles": 5,
      "utilizados": 10
    }
  ],
  "actividadReciente": [...],
  "timestamp": "2025-01-21T14:44:49.156Z"
}
```

### GET /api/estadisticas/maquina/{maquinaId}
Obtiene estadísticas detalladas de una máquina específica.

**Parámetros de consulta:**
- `ultimoMes=true` - Filtrar por último mes
- `fechaInicio` - Fecha de inicio (YYYY-MM-DD)
- `fechaFin` - Fecha de fin (YYYY-MM-DD)

**Ejemplo:**
```bash
curl "https://backend-vkuq.onrender.com/api/estadisticas/maquina/6f7f5706-5323-4c57-9b1d-fd7c908a09ed?ultimoMes=true"
```

**Respuesta:**
```json
{
  "maquina": {
    "id": "6f7f5706-5323-4c57-9b1d-fd7c908a09ed",
    "nombre": "Laser 1"
  },
  "periodo": {
    "ultimoMes": true,
    "fechaInicio": null,
    "fechaFin": null
  },
  "estadisticas": {
    "recortesDisponibles": 2,
    "recortesUtilizados": 8,
    "totalRecortes": 10,
    "porcentajeDisponibles": 20.0,
    "porcentajeUtilizados": 80.0
  },
  "estadisticasPorFecha": [...],
  "timestamp": "2025-01-21T14:44:49.156Z"
}
```

### GET /api/estadisticas/resumen
Obtiene resumen de estadísticas de todas las máquinas.

**Parámetros de consulta:**
- `ultimoMes=true` - Filtrar por último mes
- `fechaInicio` - Fecha de inicio (YYYY-MM-DD)
- `fechaFin` - Fecha de fin (YYYY-MM-DD)

**Ejemplo:**
```bash
curl "https://backend-vkuq.onrender.com/api/estadisticas/resumen"
```

**Respuesta:**
```json
{
  "periodo": {
    "ultimoMes": false,
    "fechaInicio": null,
    "fechaFin": null
  },
  "totalesGenerales": {
    "recortesDisponibles": 11,
    "recortesUtilizados": 25,
    "totalRecortes": 36,
    "porcentajeDisponibles": 30.56,
    "porcentajeUtilizados": 69.44
  },
  "estadisticasPorMaquina": [...],
  "timestamp": "2025-01-21T14:44:49.156Z"
}
```

---

## 🔌 Eventos Socket.IO

La API incluye eventos en tiempo real usando Socket.IO para notificar cambios en los recortes.

### Conexión
```javascript
const socket = io('https://backend-vkuq.onrender.com');
```

### Eventos Disponibles

#### Eventos de Recepción (del servidor al cliente)
- `initialMaquinas` - Lista inicial de máquinas
- `initialRecortes` - Lista inicial de recortes disponibles
- `initialRecortesUtilizados` - Lista inicial de recortes utilizados
- `newRecorte` - Nuevo recorte creado
- `recorteUpdated` - Recorte actualizado
- `recorteUtilizado` - Recorte marcado como utilizado
- `recorteDisponibleUpdated` - Recorte disponible actualizado
- `recorteDeleted` - Recorte eliminado

#### Eventos de Envío (del cliente al servidor)
- `getRecortes` - Solicitar recarga de recortes

### Ejemplo de Uso
```javascript
const socket = io('https://backend-vkuq.onrender.com');

// Escuchar nuevos recortes
socket.on('newRecorte', (recorte) => {
  console.log('Nuevo recorte:', recorte);
  // Actualizar UI
});

// Escuchar recortes utilizados
socket.on('recorteUtilizado', (recorte) => {
  console.log('Recorte utilizado:', recorte);
  // Actualizar estadísticas
});

// Solicitar recarga de datos
socket.emit('getRecortes');
```

---

## 📊 Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## 💡 Ejemplos de Respuesta

### Respuesta de Error
```json
{
  "error": "Descripción del error",
  "message": "Mensaje detallado del error"
}
```

### Respuesta de Paginación
```json
{
  "page": 1,
  "limit": 10,
  "total": 45,
  "totalPages": 5,
  "data": []
}
```

---

## 🔧 Notas Técnicas

### Vistas de Base de Datos
Los endpoints paginados utilizan las siguientes vistas optimizadas:
- `vw_recortes_maquina_false`: Para recortes pendientes
- `vw_recortes_maquina_true`: Para recortes completados

### Índices de Optimización
- `idx_recortes_maquina_estado`: Índice compuesto en (maquinaId, estado)
- `idx_recortes_fecha_creacion`: Índice en fecha_creacion
- `idx_recortes_maquina_fecha`: Índice compuesto en (maquinaId, fecha_creacion)

### Ordenamiento
- **Recortes pendientes**: Ordenados por `fecha_creacion` DESC
- **Recortes completados**: Ordenados por `fecha_creacion` DESC

### Límites
- Máximo 100 elementos por página
- Por defecto 10 elementos por página

---

## 🚀 Ejemplos de Uso con cURL

### Obtener máquinas disponibles
```bash
curl -X GET "https://backend-vkuq.onrender.com/api/maquinas" \
  -H "Accept: application/json"
```

### Obtener recortes pendientes paginados
```bash
curl -X GET "https://backend-vkuq.onrender.com/api/recortes/maquina/6f7f5706-5323-4c57-9b1d-fd7c908a09ed/pendientes?page=1&limit=5" \
  -H "Accept: application/json"
```

### Crear nuevo recorte
```bash
curl -X POST "https://backend-vkuq.onrender.com/api/recortes" \
  -F "largo=150.5" \
  -F "ancho=75.2" \
  -F "espesor=4.0" \
  -F "cantidad=3" \
  -F "maquinaId=6f7f5706-5323-4c57-9b1d-fd7c908a09ed" \
  -F "observaciones=Corte urgente" \
  -F "imagen=@archivo.jpg"
```

---

## 📱 Ejemplos de Uso con JavaScript

### Obtener recortes pendientes
```javascript
const response = await fetch('https://backend-vkuq.onrender.com/api/recortes/maquina/6f7f5706-5323-4c57-9b1d-fd7c908a09ed/pendientes?page=1&limit=10');
const data = await response.json();
console.log(`Total recortes pendientes: ${data.total}`);
console.log(`Página ${data.page} de ${data.totalPages}`);
```

### Crear nuevo cliente
```javascript
const response = await fetch('https://backend-vkuq.onrender.com/api/clientes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Cliente Ejemplo'
  })
});
const cliente = await response.json();
```

---

*Documentación generada para Recortes App - Backend API v1.0*
*Última actualización: Enero 2025*