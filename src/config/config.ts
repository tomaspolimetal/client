// Configuración de la aplicación
const config = {
  // URL del backend - usa variable de entorno o valor por defecto de producción
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://backend-vkuq.onrender.com',
  
  // Configuración del socket - usa variable de entorno o valor por defecto de producción
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'https://backend-vkuq.onrender.com',
  
  // Configuración de transporte para socket
  SOCKET_CONFIG: {
    transports: ['websocket', 'polling'], // Incluir polling como fallback para producción
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  }
};

export default config;