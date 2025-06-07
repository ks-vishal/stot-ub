import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect() {
        if (!this.socket) {
            this.socket = io('ws://localhost:3000', {
                transports: ['websocket'],
                auth: {
                    token: localStorage.getItem('token')
                }
            });

            this.socket.on('connect', () => {
                console.log('Connected to WebSocket server');
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from WebSocket server');
            });

            this.socket.on('error', (error) => {
                console.error('WebSocket error:', error);
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    subscribe(event, callback) {
        if (!this.socket) {
            this.connect();
        }

        this.socket.on(event, callback);
        this.listeners.set(event, callback);
    }

    unsubscribe(event) {
        if (this.socket && this.listeners.has(event)) {
            this.socket.off(event, this.listeners.get(event));
            this.listeners.delete(event);
        }
    }

    unsubscribeAll() {
        if (this.socket) {
            this.listeners.forEach((callback, event) => {
                this.socket.off(event, callback);
            });
            this.listeners.clear();
        }
    }
}

export default new SocketService(); 