import io from 'socket.io-client';
import config from '@/config/config';

// Singleton pattern para mantener una única instancia del socket
let socket: any;

function getSocket() {
  if (!socket) {
    socket = io(config.SOCKET_URL, config.SOCKET_CONFIG);
  }
  return socket;
}

// Exportamos tanto la función como la instancia para mantener compatibilidad
export { getSocket };
export default getSocket();
