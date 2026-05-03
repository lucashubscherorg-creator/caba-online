// ============================================
// useSocket HOOK — CABA ONLINE
// ============================================

import { useEffect, useRef } from 'react';
import { getSocket, onSocketEvent } from '../services/socket';
import type { SocketEvent } from '@shared/types';

type Handler<T = unknown> = (data: T) => void;

/**
 * Subscribe to a Socket.io event for the lifetime of the component.
 * Automatically unsubscribes on unmount.
 */
export function useSocketEvent<T = unknown>(
  event: SocketEvent | string,
  handler: Handler<T>
) {
  // Keep handler ref stable to avoid re-subscribing on every render
  const handlerRef = useRef<Handler<T>>(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const stableHandler = (data: T) => handlerRef.current(data);
    const unsub = onSocketEvent<T>(event, stableHandler);
    return unsub;
  }, [event]);
}

/**
 * Returns whether the socket is currently connected.
 */
export function useSocketConnected(): boolean {
  const socket = getSocket();
  return socket?.connected ?? false;
}

/**
 * Emit a socket event imperatively.
 */
export function useSocketEmit() {
  return (event: SocketEvent | string, payload?: unknown) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(event, payload);
    } else {
      console.warn('[Socket] No conectado para emitir:', event);
    }
  };
}
