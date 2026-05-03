import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { env } from '../config/env';
import { AppError } from './errorHandler';

// ─── Helmet (CSP tuned for the game) ───────────────────────────────────────

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: [
        "'self'",
        env.SUPABASE_URL,
        env.CLIENT_URL,
        // Allow WebSocket connections (ws/wss)
        env.CLIENT_URL.replace(/^http/, 'ws'),
        env.CLIENT_URL.replace(/^http/, 'wss'),
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // needed for socket.io
  hsts:
    env.NODE_ENV === 'production'
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
});

// ─── CORS ──────────────────────────────────────────────────────────────────

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, mobile apps)
    if (!origin) return callback(null, true);
    if (origin === env.CLIENT_URL) return callback(null, true);
    callback(new AppError(`CORS: origen no permitido — ${origin}`, 403));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24h preflight cache
});

// ─── Rate limiters ─────────────────────────────────────────────────────────

/** General limiter applied to all routes */
export const generalRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX, // default 100 / 15min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Demasiadas solicitudes, intenta más tarde' },
  skipSuccessfulRequests: false,
});

/** Strict limiter for auth endpoints (login, register, refresh) */
export const authRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiados intentos de autenticación, espera 15 minutos',
  },
  skipSuccessfulRequests: false,
});

/** Relaxed limiter for regular API reads */
export const apiRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Límite de API alcanzado, intenta más tarde' },
  skipSuccessfulRequests: true,
});

// ─── Input sanitisation ────────────────────────────────────────────────────

/**
 * Strips null bytes and trims string values in req.body recursively.
 * This is a lightweight defence-in-depth measure; Zod schemas are the
 * primary validation gate.
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/\0/g, '').trim();
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // Drop prototype-polluting keys
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      sanitized[k] = sanitizeValue(v);
    }
    return sanitized;
  }
  return value;
}

export const sanitizeInputs: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
};
