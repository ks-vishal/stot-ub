import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../contexts/WebSocketContext';

export const useWebSocket = (eventName, callback) => {
  const socket = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleEvent = (data) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(eventName, handleEvent);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(eventName, handleEvent);
    };
  }, [socket, eventName]);

  const emit = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  return { isConnected, emit };
}; 