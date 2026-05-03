import { Server } from 'socket.io';

let ioInstance: Server | null = null;

export const setIO = (io: Server): void => {
  ioInstance = io;
};

export const getIO = (): Server => {
  if (!ioInstance) {
    throw new Error(
      'Socket.io instance not initialised yet. Call setIO(io) before using getIO().',
    );
  }
  return ioInstance;
};
