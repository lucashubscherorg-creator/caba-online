-- ============================================
-- CABA ONLINE — SUPABASE SCHEMA
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- ============================================

-- Extensiones
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- TABLA: users
-- ============================================
create table if not exists public.users (
  id            uuid primary key default uuid_generate_v4(),
  username      text not null unique,
  email         text not null unique,
  password_hash text not null,
  role          text not null default 'player' check (role in ('player', 'moderator', 'admin')),
  role_id       text,
  level         integer not null default 1,
  experience    integer not null default 0,
  balance       numeric(12, 2) not null default 50000,
  reputation    integer not null default 50,
  neighborhood  text,
  is_online     boolean not null default false,
  position_lat  double precision,
  position_lng  double precision,
  skills        jsonb not null default '{
    "streetSmarts": 1,
    "bureaucracy": 1,
    "negotiation": 1,
    "physical": 1,
    "technical": 1,
    "social": 1,
    "creativity": 1,
    "leadership": 1
  }'::jsonb,
  stats         jsonb not null default '{
    "missionsCompleted": 0,
    "missionsAbandoned": 0,
    "totalEarned": 0,
    "totalSpent": 0,
    "timePlayedMinutes": 0,
    "eventsParticipated": 0,
    "npcsHelped": 0,
    "npcsBetrayed": 0
  }'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_username on public.users(username);
create index if not exists idx_users_is_online on public.users(is_online);
create index if not exists idx_users_neighborhood on public.users(neighborhood);

-- ============================================
-- TABLA: refresh_tokens
-- ============================================
create table if not exists public.refresh_tokens (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  token      text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_refresh_tokens_token   on public.refresh_tokens(token);
create index if not exists idx_refresh_tokens_user_id on public.refresh_tokens(user_id);
create index if not exists idx_refresh_tokens_expires on public.refresh_tokens(expires_at);

-- Limpiar tokens expirados automáticamente cada hora (via pg_cron si disponible)
-- Alternativa: el servidor los limpia al hacer refresh

-- ============================================
-- TABLA: world_events
-- ============================================
create table if not exists public.world_events (
  id            uuid primary key default uuid_generate_v4(),
  type          text not null check (type in (
    'protest', 'piquete', 'corte', 'election', 'economic_crisis',
    'festival', 'police_operation', 'power_outage', 'water_cut',
    'transport_strike', 'price_hike', 'dolar_jump', 'rain',
    'heat_wave', 'flood', 'fire', 'accident', 'political_scandal',
    'court_ruling', 'union_strike', 'concert', 'sporting_event', 'other'
  )),
  title         text not null,
  description   text not null,
  neighborhood  text,
  lat           double precision,
  lng           double precision,
  radius        integer not null default 500,
  severity      integer not null default 3 check (severity between 1 and 10),
  icon_emoji    text not null default '📢',
  affects       text[] not null default '{}',
  economy_impact jsonb not null default '{}',
  is_active     boolean not null default true,
  source        text not null default 'system' check (source in ('rss', 'ai', 'admin', 'system')),
  source_url    text,
  start_time    timestamptz not null default now(),
  end_time      timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_world_events_active      on public.world_events(is_active);
create index if not exists idx_world_events_type        on public.world_events(type);
create index if not exists idx_world_events_neighborhood on public.world_events(neighborhood);
create index if not exists idx_world_events_start_time  on public.world_events(start_time desc);

-- ============================================
-- TABLA: missions
-- ============================================
create table if not exists public.missions (
  id              uuid primary key default uuid_generate_v4(),
  template_id     text not null,
  title           text not null,
  description     text not null,
  type            text not null check (type in (
    'solo', 'cooperative', 'competitive', 'group'
  )),
  category        text not null check (category in (
    'work', 'economy', 'survival', 'social', 'political',
    'criminal', 'cultural', 'bureaucratic', 'transport', 'health'
  )),
  difficulty      integer not null default 1 check (difficulty between 1 and 10),
  time_limit_mins integer,
  reward_money    numeric(10, 2) not null default 0,
  reward_xp       integer not null default 0,
  reward_rep      integer not null default 0,
  penalty_money   numeric(10, 2) not null default 0,
  penalty_rep     integer not null default 0,
  steps           jsonb not null default '[]'::jsonb,
  required_skills jsonb not null default '{}'::jsonb,
  assigned_to     uuid[] not null default '{}',
  completed_by    uuid[] not null default '{}',
  status          text not null default 'active' check (status in (
    'active', 'completed', 'failed', 'expired', 'abandoned'
  )),
  neighborhood    text,
  related_event_id uuid references public.world_events(id) on delete set null,
  metadata        jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  expires_at      timestamptz,
  completed_at    timestamptz
);

create index if not exists idx_missions_status       on public.missions(status);
create index if not exists idx_missions_assigned_to  on public.missions using gin(assigned_to);
create index if not exists idx_missions_neighborhood on public.missions(neighborhood);
create index if not exists idx_missions_created_at   on public.missions(created_at desc);
create index if not exists idx_missions_expires_at   on public.missions(expires_at);

-- ============================================
-- TABLA: transactions
-- ============================================
create table if not exists public.transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  type        text not null check (type in (
    'mission_reward', 'mission_penalty', 'trade', 'tax',
    'rent', 'purchase', 'salary', 'bribe', 'fine',
    'transfer', 'system', 'interest'
  )),
  amount      numeric(12, 2) not null,
  balance_after numeric(12, 2) not null,
  description text not null,
  mission_id  uuid references public.missions(id) on delete set null,
  from_user   uuid references public.users(id) on delete set null,
  to_user     uuid references public.users(id) on delete set null,
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists idx_transactions_user_id    on public.transactions(user_id);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);
create index if not exists idx_transactions_type       on public.transactions(type);
create index if not exists idx_transactions_mission_id on public.transactions(mission_id);

-- ============================================
-- TABLA: npcs
-- ============================================
create table if not exists public.npcs (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  role_id      text not null,
  neighborhood text not null,
  personality  text not null check (personality in (
    'friendly', 'neutral', 'suspicious', 'hostile', 'corrupt',
    'helpful', 'greedy', 'fearful', 'ambitious', 'desperate'
  )),
  faction      text,
  position_lat double precision not null,
  position_lng double precision not null,
  dialogue     jsonb not null default '[]'::jsonb,
  inventory    jsonb not null default '[]'::jsonb,
  is_active    boolean not null default true,
  last_seen    timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index if not exists idx_npcs_neighborhood on public.npcs(neighborhood);
create index if not exists idx_npcs_role_id      on public.npcs(role_id);
create index if not exists idx_npcs_is_active    on public.npcs(is_active);

-- ============================================
-- TABLA: player_interactions (log de interacciones NPC-jugador)
-- ============================================
create table if not exists public.player_interactions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  npc_id     uuid references public.npcs(id) on delete set null,
  type       text not null check (type in (
    'dialogue', 'trade', 'mission_start', 'betrayal', 'help', 'bribe', 'fight'
  )),
  outcome    text not null check (outcome in ('success', 'failure', 'neutral')),
  rep_change integer not null default 0,
  metadata   jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_interactions_user_id    on public.player_interactions(user_id);
create index if not exists idx_interactions_created_at on public.player_interactions(created_at desc);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
alter table public.users               enable row level security;
alter table public.refresh_tokens      enable row level security;
alter table public.world_events        enable row level security;
alter table public.missions            enable row level security;
alter table public.transactions        enable row level security;
alter table public.npcs                enable row level security;
alter table public.player_interactions enable row level security;

-- El backend usa service_role (bypasa RLS) — estas políticas son para acceso directo desde cliente si se necesitara
-- Por ahora, solo el service role puede escribir; lectura pública en eventos/NPCs

create policy "Eventos mundiales visibles para todos"
  on public.world_events for select
  using (is_active = true);

create policy "NPCs visibles para todos"
  on public.npcs for select
  using (is_active = true);

-- ============================================
-- FUNCIÓN: updated_at trigger
-- ============================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ============================================
-- FUNCIÓN: limpiar tokens expirados
-- ============================================
create or replace function public.cleanup_expired_tokens()
returns void language plpgsql as $$
begin
  delete from public.refresh_tokens where expires_at < now();
end;
$$;

-- ============================================
-- DATOS INICIALES: admin user (cambiar contraseña en producción)
-- ============================================
-- NO insertar aquí — el primer admin se crea via API con ADMIN_SECRET

-- ============================================
-- ÍNDICES ADICIONALES para queries frecuentes
-- ============================================
create index if not exists idx_users_level      on public.users(level desc);
create index if not exists idx_users_balance    on public.users(balance desc);
create index if not exists idx_users_reputation on public.users(reputation desc);
