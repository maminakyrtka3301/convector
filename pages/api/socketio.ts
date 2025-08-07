import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
    if (!(res.socket as any).server.io) {
        console.log('Создаём новый Socket.IO сервер');
        const io = new Server((res.socket as any).server, {
            path: '/api/socketio',
            cors: {
                origin: '*',
            },
        });

        (res.socket as any).server.io = io;

        io.on('connection', socket => {
            console.log('Клиент подключился', socket.id);
            socket.on('message', msg => {
                console.log('Получено сообщение:', msg);
                socket.broadcast.emit('message', msg);
            });
        });
    } else {
        console.log('Socket.IO сервер уже запущен');
    }
    res.end();
};

export default ioHandler;
