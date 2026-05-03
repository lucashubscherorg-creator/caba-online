import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';
import { env } from '../config/env';

// ─── Custom error classes ───────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly fields?: Record<string, string[]>;

  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, 400);
    this.fields = fields;
  }
}

export class AuthError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

// ─── Error response shape ───────────────────────────────────────────────────

interface ErrorResponse {
  success: false;
  error: string;
  fields?: Record<string, string[]>;
  stack?: string;
}

// ─── Central error handler middleware ──────────────────────────────────────

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Zod validation errors → 400
  if (err instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    for (const issue of err.errors) {
      const key = issue.path.join('.') || 'root';
      if (!fields[key]) fields[key] = [];
      fields[key].push(issue.message);
    }

    const body: ErrorResponse = {
      success: false,
      error: 'Datos de entrada inválidos',
      fields,
    };
    res.status(400).json(body);
    return;
  }

  // Operational errors (AppError subclasses)
  if (err instanceof AppError) {
    const body: ErrorResponse = {
      success: false,
      error: err.message,
    };

    if (err instanceof ValidationError && err.fields) {
      body.fields = err.fields;
    }

    if (env.NODE_ENV !== 'production' && err.statusCode >= 500) {
      body.stack = err.stack;
    }

    if (err.statusCode >= 500) {
      logger.error('Operational server error', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });
    }

    res.status(err.statusCode).json(body);
    return;
  }

  // Unknown / programmer errors — never leak details in production
  logger.error('Unhandled error', {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  const body: ErrorResponse = {
    success: false,
    error:
      env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : err instanceof Error
          ? err.message
          : String(err),
  };

  if (env.NODE_ENV !== 'production' && err instanceof Error) {
    body.stack = err.stack;
  }

  res.status(500).json(body);
}

// ─── 404 handler ───────────────────────────────────────────────────────────

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Ruta ${req.method} ${req.path}`));
}
