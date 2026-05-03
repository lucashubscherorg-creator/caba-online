/**
 * Supabase client — service role (bypasses RLS for server-side operations)
 *
 * Expected schema:
 *
 * -- users
 * CREATE TABLE users (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   username VARCHAR(30) UNIQUE NOT NULL,
 *   email VARCHAR(255) UNIQUE NOT NULL,
 *   password_hash VARCHAR(255) NOT NULL,
 *   role_id VARCHAR(50) DEFAULT 'sin_trabajo',
 *   neighborhood_id VARCHAR(50) DEFAULT 'microcentro',
 *   balance BIGINT DEFAULT 50000,
 *   reputation INTEGER DEFAULT 50,
 *   level INTEGER DEFAULT 1,
 *   skills JSONB DEFAULT '{"street":1,"social":1,"technical":1,"physical":1,"intelligence":1}',
 *   position JSONB DEFAULT '{"lat":-34.6083,"lng":-58.3712}',
 *   is_online BOOLEAN DEFAULT FALSE,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- refresh_tokens
 * CREATE TABLE refresh_tokens (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 *   token VARCHAR(512) UNIQUE NOT NULL,
 *   expires_at TIMESTAMPTZ NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- world_events
 * CREATE TABLE world_events (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   type VARCHAR(50) NOT NULL,
 *   title VARCHAR(200) NOT NULL,
 *   description TEXT NOT NULL,
 *   affected_neighborhoods TEXT[] DEFAULT '{}',
 *   economic_impact INTEGER DEFAULT 0,
 *   safety_impact INTEGER DEFAULT 0,
 *   duration_minutes INTEGER NOT NULL,
 *   start_time TIMESTAMPTZ NOT NULL,
 *   end_time TIMESTAMPTZ NOT NULL,
 *   is_active BOOLEAN DEFAULT TRUE,
 *   source_news TEXT,
 *   icon_emoji VARCHAR(10) DEFAULT '📰',
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }
  return _supabase;
}

export const supabase = getSupabaseClient();
