import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

let io: Server | null = null;

export function initSocket(server: HttpServer) {
    if (!io) {
        io = new Server(server, {
            cors: { origin: '*' },
            path: '/api/socketio',
        });
        io.on('connection', socket => {
            console.log('Клиент подключился', socket.id);
        });
    }
    return io;
}

export function getIO() {
    if (!io) throw new Error('Socket.io не инициализирован');
    return io;
}
