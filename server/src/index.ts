import 'dotenv/config';
import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { env } from './config/env';
import { logger, logRequest } from './config/logger';

import {
  helmetMiddleware,
  corsMiddleware,
  generalRateLimit,
  sanitizeInputs,
} from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import worldRoutes from './modules/world/world.routes';
import eventsRoutes from './modules/events/events.routes';
import rolesRoutes from './modules/roles/roles.routes';
import economyRoutes from './modules/economy/economy.routes';
import missionsRoutes from './modules/missions/missions.routes';
import npcsRoutes from './modules/npcs/npcs.routes';
import playersRoutes from './modules/players/players.routes';

import { setIO } from './websockets/ioInstance';
import { startEventsEngine, stopEventsEngine } from './modules/events/eventsService';
import { startNewsScheduler, stopNewsScheduler } from './modules/news/newsScheduler';

// ─── Express app ────────────────────────────────────────────────────────────

const app = express();

// ─── Security middleware ─────────────────────────────────────────────────────

app.set('trust proxy', 1); // Required for correct IP behind reverse proxies
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(generalRateLimit);

// ─── Parsing ─────────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(sanitizeInputs);

// ─── HTTP request logging ────────────────────────────────────────────────────

app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logRequest(req.method, req.path, res.statusCode, Date.now() - start);
  });
  next();
});

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

// ─── API routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/world', worldRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/economy', economyRoutes);
app.use('/api/missions', missionsRoutes);
app.use('/api/npcs', npcsRoutes);
app.use('/api/players', playersRoutes);

// ─── 404 + error handlers (must be last) ─────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ─── HTTP server ──────────────────────────────────────────────────────────────

const httpServer = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────────

export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  maxHttpBufferSize: 64 * 1024, // 64 KB max message size
  pingTimeout: 20_000,
  pingInterval: 25_000,
});

// Register the io instance so other modules can access it via getIO()
setIO(io);

io.on('connection', (socket) => {
  logger.info('Socket connected', { socketId: socket.id });

  // Allow clients to join the global world room and neighbourhood rooms
  socket.on('join:world', () => {
    socket.join('world');
  });

  socket.on('join:neighborhood', (neighborhoodId: string) => {
    if (typeof neighborhoodId === 'string' && neighborhoodId.length <= 60) {
      socket.join(`neighborhood:${neighborhoodId}`);
    }
  });

  socket.on('leave:neighborhood', (neighborhoodId: string) => {
    if (typeof neighborhoodId === 'string') {
      socket.leave(`neighborhood:${neighborhoodId}`);
    }
  });

  socket.on('disconnect', (reason) => {
    logger.info('Socket disconnected', { socketId: socket.id, reason });
  });

  socket.on('error', (err) => {
    logger.error('Socket error', { socketId: socket.id, error: err.message });
  });
});

// ─── Serverless detection ─────────────────────────────────────────────────────
// On Vercel (process.env.VERCEL === '1') we skip listen, background engines,
// and process signal handlers — the serverless platform manages the lifecycle.

const isServerless = Boolean(process.env.VERCEL);

// ─── Background engines ───────────────────────────────────────────────────────

if (!isServerless) {
  startEventsEngine();
  startNewsScheduler();
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

if (!isServerless) {
  function shutdown(signal: string): void {
    logger.info(`Received ${signal}. Graceful shutdown initiated…`);

    stopEventsEngine();
    stopNewsScheduler();

    const forceExitTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10_000);

    forceExitTimer.unref();

    io.close(() => {
      logger.info('Socket.io server closed');
      httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception — shutting down', {
      message: err.message,
      stack: err.stack,
    });
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });
}

// ─── Listen ───────────────────────────────────────────────────────────────────

if (!isServerless) {
  httpServer.listen(env.PORT, () => {
    logger.info('CABA Online server running', {
      port: env.PORT,
      env: env.NODE_ENV,
      client: env.CLIENT_URL,
    });
  });
}

export default app;
