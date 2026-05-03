import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthError, ForbiddenError } from './errorHandler';

export interface JwtPayload {
  sub: string;
  username: string;
  roleId: string;
  level: number;
  iat?: number;
  exp?: number;
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

function verifyAccessToken(token: string): JwtPayload {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return payload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token expirado');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Token inválido');
    }
    throw new AuthError('Error al verificar token');
  }
}

/**
 * Requires a valid Bearer JWT. Attaches decoded user to req.user.
 * Returns 401 if token is missing, invalid, or expired.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    return next(new AuthError('Token de autenticación requerido'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      username: payload.username,
      roleId: payload.roleId,
      level: payload.level,
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Same as authenticate but does NOT fail when no token is present.
 * req.user will be undefined for unauthenticated requests.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    return next();
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      username: payload.username,
      roleId: payload.roleId,
      level: payload.level,
    };
  } catch {
    // Silently ignore invalid tokens for optional auth
  }

  next();
}

/**
 * Factory: returns middleware that ensures the authenticated user has
 * at least one of the specified roles. Must be used after `authenticate`.
 */
export function requireRole(roles: string[]) {
  return function roleGuard(req: Request, _res: Response, next: NextFunction): void {
    if (!req.user) {
      return next(new AuthError('Token de autenticación requerido'));
    }

    if (!roles.includes(req.user.roleId)) {
      return next(
        new ForbiddenError(
          `Se requiere uno de estos roles: ${roles.join(', ')}`,
        ),
      );
    }

    next();
  };
}
