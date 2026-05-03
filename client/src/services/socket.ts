// ============================================
// SOCKET.IO CLIENT — CABA ONLINE
// ============================================

import { io, Socket } from 'socket.io-client';
import type { SocketEvent, SocketPayload } from '@shared/types';

let socket: Socket | null = null;
let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

// Ping the backend every 10 minutes to prevent Render free tier from sleeping
function startKeepAlive() {
  if (keepAliveInterval) return;
  const apiBase = import.meta.env.VITE_API_URL ?? '';
  keepAliveInterval = setInterval(async () => {
    try {
      await fetch(`${apiBase}/api/health`);
    } catch {
      // Ignore — server will reconnect when available
    }
  }, 10 * 60 * 1000);
}

function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}

// Exponential backoff config
const BACKOFF_BASE_MS = 1000;
const BACKOFF_MAX_MS = 30000;

export function initSocket(token: string): Socket {
  if (socket?.connected) return socket;

  if (socket) {
    socket.disconnect();
  }

  socket = io('/', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: BACKOFF_BASE_MS,
    reconnectionDelayMax: BACKOFF_MAX_MS,
    randomizationFactor: 0.5,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Conectado al servidor');
    startKeepAlive();
  });

  socket.on('disconnect', (reason) => {
    console.warn('[Socket] Desconectado:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Error de conexión:', err.message);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  stopKeepAlive();
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function updateSocketAuth(token: string) {
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }
}

type EventHandler<T = unknown> = (payload: T) => void;

export function onSocketEvent<T = unknown>(
  event: SocketEvent | string,
  handler: EventHandler<T>
): () => void {
  const sock = getSocket();
  if (!sock) {
    console.warn('[Socket] No hay conexión activa para suscribirse a:', event);
    return () => {};
  }

  sock.on(event, handler as (...args: unknown[]) => void);

  // Return cleanup function
  return () => {
    sock.off(event, handler as (...args: unknown[]) => void);
  };
}

export function emitSocketEvent<T = unknown>(
  event: SocketEvent | string,
  payload?: T
): void {
  const sock = getSocket();
  if (!sock?.connected) {
    console.warn('[Socket] No conectado, no se puede emitir:', event);
    return;
  }
  sock.emit(event, payload);
}

export function onAnySocketEvent(
  handler: (payload: SocketPayload) => void
): () => void {
  const sock = getSocket();
  if (!sock) return () => {};

  const wrapper = (event: string, ...args: unknown[]) => {
    handler({
      event: event as SocketEvent,
      data: args[0],
      timestamp: new Date().toISOString(),
    });
  };

  sock.onAny(wrapper);
  return () => sock.offAny(wrapper);
}
