import { supabase } from '../../config/supabase';
import { logger } from '../../config/logger';
import { AppError } from '../../middleware/errorHandler';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Neighborhood {
  id: string;
  name: string;
  description: string;
  safetyIndex: number;
  economicIndex: number;
  playerCount: number;
  position: { lat: number; lng: number };
}

export interface WorldEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  affectedNeighborhoods: string[];
  economicImpact: number;
  safetyImpact: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  sourceNews: string | null;
  iconEmoji: string;
  createdAt: string;
}

export interface OnlinePlayer {
  id: string;
  username: string;
  roleId: string;
  level: number;
  position: { lat: number; lng: number };
  neighborhoodId: string;
}

export interface WorldState {
  neighborhoods: Neighborhood[];
  activeEvents: WorldEvent[];
  onlinePlayers: OnlinePlayer[];
  serverTime: string;
  playerCount: number;
}

// ─── Static neighborhood data ────────────────────────────────────────────────
// In a full implementation this could live in a Supabase table.
// For now it's kept here to avoid extra DB calls on every world state request.

const NEIGHBORHOODS_BASE: Omit<Neighborhood, 'playerCount'>[] = [
  {
    id: 'microcentro',
    name: 'Microcentro',
    description: 'El corazón financiero y comercial de la ciudad',
    safetyIndex: 55,
    economicIndex: 90,
    position: { lat: -34.6083, lng: -58.3712 },
  },
  {
    id: 'palermo',
    name: 'Palermo',
    description: 'Barrio bohemio con parques, gastronomía y vida nocturna',
    safetyIndex: 70,
    economicIndex: 80,
    position: { lat: -34.5795, lng: -58.4335 },
  },
  {
    id: 'la_boca',
    name: 'La Boca',
    description: 'Barrio portuario de inmigrantes, arte callejero y fútbol',
    safetyIndex: 35,
    economicIndex: 45,
    position: { lat: -34.6345, lng: -58.3631 },
  },
  {
    id: 'recoleta',
    name: 'Recoleta',
    description: 'Zona aristocrática con museos, galerías y el famoso cementerio',
    safetyIndex: 75,
    economicIndex: 85,
    position: { lat: -34.5875, lng: -58.3934 },
  },
  {
    id: 'villa_crespo',
    name: 'Villa Crespo',
    description: 'Barrio popular con talleres, outlets y murgas',
    safetyIndex: 60,
    economicIndex: 55,
    position: { lat: -34.6024, lng: -58.4376 },
  },
  {
    id: 'mataderos',
    name: 'Mataderos',
    description: 'Barrio del interior porteño, feria artesanal y gauchesco',
    safetyIndex: 45,
    economicIndex: 40,
    position: { lat: -34.6571, lng: -58.5088 },
  },
  {
    id: 'san_telmo',
    name: 'San Telmo',
    description: 'Barrio histórico, mercado de antigüedades y tango',
    safetyIndex: 50,
    economicIndex: 60,
    position: { lat: -34.6214, lng: -58.3731 },
  },
  {
    id: 'belgrano',
    name: 'Belgrano',
    description: 'Barrio residencial con barrio chino y zona universitaria',
    safetyIndex: 72,
    economicIndex: 78,
    position: { lat: -34.5624, lng: -58.4576 },
  },
];

// ─── Service methods ────────────────────────────────────────────────────────

export async function getNeighborhoods(): Promise<Neighborhood[]> {
  // Count online players per neighborhood
  const { data: playerCounts, error } = await supabase
    .from('users')
    .select('neighborhood_id')
    .eq('is_online', true);

  if (error) {
    logger.error('Failed to fetch player counts per neighborhood', { error: error.message });
    throw new AppError('Error al obtener datos de los barrios', 500);
  }

  const countMap: Record<string, number> = {};
  for (const row of playerCounts ?? []) {
    countMap[row.neighborhood_id] = (countMap[row.neighborhood_id] ?? 0) + 1;
  }

  return NEIGHBORHOODS_BASE.map((n) => ({
    ...n,
    playerCount: countMap[n.id] ?? 0,
  }));
}

export async function getActiveEvents(): Promise<WorldEvent[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('world_events')
    .select('*')
    .eq('is_active', true)
    .gte('end_time', now)
    .lte('start_time', now)
    .order('start_time', { ascending: false });

  if (error) {
    logger.error('Failed to fetch world events', { error: error.message });
    throw new AppError('Error al obtener eventos del mundo', 500);
  }

  return (data ?? []).map(mapDbEventToWorldEvent);
}

export async function getOnlinePlayers(): Promise<OnlinePlayer[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, role_id, level, position, neighborhood_id')
    .eq('is_online', true)
    .limit(500); // Hard cap to protect the response payload

  if (error) {
    logger.error('Failed to fetch online players', { error: error.message });
    throw new AppError('Error al obtener jugadores online', 500);
  }

  return (data ?? []).map((u) => ({
    id: u.id,
    username: u.username,
    roleId: u.role_id,
    level: u.level,
    position: u.position,
    neighborhoodId: u.neighborhood_id,
  }));
}

export async function getWorldState(): Promise<WorldState> {
  // Run all three queries in parallel
  const [neighborhoods, activeEvents, onlinePlayers] = await Promise.all([
    getNeighborhoods(),
    getActiveEvents(),
    getOnlinePlayers(),
  ]);

  return {
    neighborhoods,
    activeEvents,
    onlinePlayers,
    serverTime: new Date().toISOString(),
    playerCount: onlinePlayers.length,
  };
}

// ─── DB → domain mapper ──────────────────────────────────────────────────────

function mapDbEventToWorldEvent(row: Record<string, unknown>): WorldEvent {
  return {
    id: row.id as string,
    type: row.type as string,
    title: row.title as string,
    description: row.description as string,
    affectedNeighborhoods: (row.affected_neighborhoods as string[]) ?? [],
    economicImpact: (row.economic_impact as number) ?? 0,
    safetyImpact: (row.safety_impact as number) ?? 0,
    durationMinutes: row.duration_minutes as number,
    startTime: row.start_time as string,
    endTime: row.end_time as string,
    isActive: row.is_active as boolean,
    sourceNews: (row.source_news as string | null) ?? null,
    iconEmoji: (row.icon_emoji as string) ?? '📰',
    createdAt: row.created_at as string,
  };
}
