import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../../config/supabase';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import {
  AuthError,
  ConflictError,
  NotFoundError,
  AppError,
} from '../../middleware/errorHandler';
import type { JwtPayload } from '../../middleware/auth';
import type { RegisterInput, LoginInput } from './auth.schemas';

const BCRYPT_ROUNDS = 12;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserPublic {
  id: string;
  username: string;
  email: string;
  roleId: string;
  neighborhoodId: string;
  balance: number;
  reputation: number;
  level: number;
  skills: Record<string, number>;
  position: { lat: number; lng: number };
  createdAt: string;
}

interface DbUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role_id: string;
  neighborhood_id: string;
  balance: number;
  reputation: number;
  level: number;
  skills: Record<string, number>;
  position: { lat: number; lng: number };
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Token helpers ──────────────────────────────────────────────────────────

const ACCESS_TOKEN_SECONDS = 15 * 60; // 15 minutes

function generateAccessToken(user: DbUser): string {
  const payload: JwtPayload = {
    sub: user.id,
    username: user.username,
    roleId: user.role_id,
    level: user.level,
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_SECONDS,
  });
}

function refreshTokenExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}

async function persistRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = refreshTokenExpiresAt();
  const { error } = await supabase
    .from('refresh_tokens')
    .insert({ user_id: userId, token, expires_at: expiresAt.toISOString() });

  if (error) {
    logger.error('Failed to persist refresh token', { error: error.message, userId });
    throw new AppError('Error al guardar sesión', 500);
  }
}

async function buildTokenPair(user: DbUser): Promise<AuthTokens> {
  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign({ sub: user.id }, env.JWT_SECRET, {
    expiresIn: '7d',
  });

  await persistRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken, expiresIn: ACCESS_TOKEN_SECONDS };
}

// ─── Service methods ────────────────────────────────────────────────────────

export async function register(input: RegisterInput): Promise<{ user: UserPublic; tokens: AuthTokens }> {
  // Check for duplicates
  const { data: existingByEmail } = await supabase
    .from('users')
    .select('id')
    .eq('email', input.email)
    .maybeSingle();

  if (existingByEmail) {
    throw new ConflictError('Ya existe una cuenta con ese email');
  }

  const { data: existingByUsername } = await supabase
    .from('users')
    .select('id')
    .eq('username', input.username)
    .maybeSingle();

  if (existingByUsername) {
    throw new ConflictError('Ese nombre de usuario ya está en uso');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      username: input.username,
      email: input.email,
      password_hash: passwordHash,
    })
    .select()
    .single();

  if (error || !newUser) {
    logger.error('Failed to create user', { error: error?.message });
    throw new AppError('Error al crear la cuenta', 500);
  }

  const tokens = await buildTokenPair(newUser as DbUser);

  return { user: toPublicUser(newUser as DbUser), tokens };
}

export async function login(input: LoginInput): Promise<{ user: UserPublic; tokens: AuthTokens }> {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', input.email)
    .maybeSingle();

  if (error) {
    logger.error('DB error during login', { error: error.message });
    throw new AppError('Error al iniciar sesión', 500);
  }

  if (!user) {
    // Use the same message for missing email and wrong password to prevent enumeration
    throw new AuthError('Credenciales inválidas');
  }

  const dbUser = user as DbUser;
  const passwordValid = await bcrypt.compare(input.password, dbUser.password_hash);

  if (!passwordValid) {
    throw new AuthError('Credenciales inválidas');
  }

  // Mark user as online
  await supabase
    .from('users')
    .update({ is_online: true, updated_at: new Date().toISOString() })
    .eq('id', dbUser.id);

  const tokens = await buildTokenPair(dbUser);

  return { user: toPublicUser(dbUser), tokens };
}

export async function refreshToken(token: string): Promise<{ accessToken: string; expiresIn: number }> {
  // Verify the JWT signature first
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      // Clean up expired token from DB
      await supabase.from('refresh_tokens').delete().eq('token', token);
      throw new AuthError('Refresh token expirado, inicia sesión nuevamente');
    }
    throw new AuthError('Refresh token inválido');
  }

  // Check it actually exists in the DB (allows revocation)
  const { data: storedToken, error } = await supabase
    .from('refresh_tokens')
    .select('id, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (error) {
    logger.error('DB error checking refresh token', { error: error.message });
    throw new AppError('Error al renovar sesión', 500);
  }

  if (!storedToken) {
    throw new AuthError('Refresh token revocado o inválido');
  }

  if (new Date(storedToken.expires_at) < new Date()) {
    await supabase.from('refresh_tokens').delete().eq('token', token);
    throw new AuthError('Refresh token expirado, inicia sesión nuevamente');
  }

  // Fetch up-to-date user (role or level might have changed)
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, username, role_id, level')
    .eq('id', payload.sub)
    .maybeSingle();

  if (userError || !user) {
    throw new AuthError('Usuario no encontrado');
  }

  const dbUser = user as Pick<DbUser, 'id' | 'username' | 'role_id' | 'level'>;

  const accessToken = jwt.sign(
    { sub: dbUser.id, username: dbUser.username, roleId: dbUser.role_id, level: dbUser.level },
    env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_SECONDS },
  );

  return { accessToken, expiresIn: ACCESS_TOKEN_SECONDS };
}

export async function logout(userId: string): Promise<void> {
  const { error } = await supabase
    .from('refresh_tokens')
    .delete()
    .eq('user_id', userId);

  if (error) {
    logger.error('Failed to delete refresh tokens on logout', { error: error.message, userId });
    throw new AppError('Error al cerrar sesión', 500);
  }

  await supabase
    .from('users')
    .update({ is_online: false, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

export async function getMe(userId: string): Promise<UserPublic> {
  const { data: user, error } = await supabase
    .from('users')
    .select(
      'id, username, email, role_id, neighborhood_id, balance, reputation, level, skills, position, created_at',
    )
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    logger.error('DB error fetching user', { error: error.message, userId });
    throw new AppError('Error al obtener datos del usuario', 500);
  }

  if (!user) {
    throw new NotFoundError('Usuario');
  }

  return toPublicUser(user as DbUser);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function toPublicUser(user: DbUser): UserPublic {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    roleId: user.role_id,
    neighborhoodId: user.neighborhood_id,
    balance: user.balance,
    reputation: user.reputation,
    level: user.level,
    skills: user.skills,
    position: user.position,
    createdAt: user.created_at,
  };
}
