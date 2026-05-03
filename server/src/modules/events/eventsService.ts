// ============================================================
// MOTOR DE EVENTOS DEL MUNDO — CABA ONLINE
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../config/supabase';
import { logger } from '../../config/logger';
import { getIO } from '../../websockets/ioInstance';
import { NEIGHBORHOODS } from '../../../../shared/constants';

// ── DB row shape (snake_case) ────────────────────────────────
interface DbWorldEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  affected_neighborhoods: string[];
  economic_impact: number;
  safety_impact: number;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  source_news: string | null;
  icon_emoji: string;
  created_at?: string;
}

// ── Domain shape (camelCase — mirrors shared/types WorldEvent) ─
export interface WorldEventDomain {
  id: string;
  type: WorldEventType;
  title: string;
  description: string;
  affectedNeighborhoods: string[];
  economicImpact: number;
  safetyImpact: number;
  duration: number;          // minutes
  startTime: string;
  endTime: string;
  isActive: boolean;
  sourceNews?: string;
  iconEmoji: string;
}

export type WorldEventType =
  | 'marcha'
  | 'paro'
  | 'dolar_salto'
  | 'inflacion_pico'
  | 'evento_cultural'
  | 'operativo_policial'
  | 'corte_servicio'
  | 'crisis_economica'
  | 'elecciones'
  | 'noticia_real';

// ── Economy state ─────────────────────────────────────────────
interface EconomyState {
  globalModifier: number;
  dollarRate: number;
  inflationIndex: number;
  lastUpdated: string;
}

let economyState: EconomyState = {
  globalModifier: 1.0,
  dollarRate: 1200,
  inflationIndex: 0,
  lastUpdated: new Date().toISOString(),
};

// ── Timer handles ─────────────────────────────────────────────
let expireTimer: ReturnType<typeof setInterval> | null = null;
let randomEventTimer: ReturnType<typeof setTimeout> | null = null;

// ── Helpers ───────────────────────────────────────────────────
const allNeighborhoodIds = (): string[] => Object.keys(NEIGHBORHOODS);

function randomDuration(minMin: number, maxMin: number): number {
  return Math.floor(Math.random() * (maxMin - minMin + 1)) + minMin;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const eventIcon: Record<WorldEventType, string> = {
  marcha:             '✊',
  paro:               '🚫',
  dolar_salto:        '💵',
  inflacion_pico:     '📈',
  evento_cultural:    '🎉',
  operativo_policial: '🚔',
  corte_servicio:     '⚡',
  crisis_economica:   '📉',
  elecciones:         '🗳️',
  noticia_real:       '📰',
};

// ── DB ↔ Domain mappers ───────────────────────────────────────
function dbToDomain(row: DbWorldEvent): WorldEventDomain {
  return {
    id:                   row.id,
    type:                 row.type as WorldEventType,
    title:                row.title,
    description:          row.description,
    affectedNeighborhoods: row.affected_neighborhoods ?? [],
    economicImpact:       row.economic_impact,
    safetyImpact:         row.safety_impact,
    duration:             row.duration_minutes,
    startTime:            row.start_time,
    endTime:              row.end_time,
    isActive:             row.is_active,
    sourceNews:           row.source_news ?? undefined,
    iconEmoji:            row.icon_emoji,
  };
}

function domainToDb(
  event: WorldEventDomain,
): DbWorldEvent {
  return {
    id:                      event.id,
    type:                    event.type,
    title:                   event.title,
    description:             event.description,
    affected_neighborhoods:  event.affectedNeighborhoods,
    economic_impact:         event.economicImpact,
    safety_impact:           event.safetyImpact,
    duration_minutes:        event.duration,
    start_time:              event.startTime,
    end_time:                event.endTime,
    is_active:               event.isActive,
    source_news:             event.sourceNews ?? null,
    icon_emoji:              event.iconEmoji,
  };
}

// ─────────────────────────────────────────────────────────────
// createWorldEvent
// ─────────────────────────────────────────────────────────────
export async function createWorldEvent(
  input: Omit<WorldEventDomain, 'id' | 'startTime' | 'endTime' | 'isActive' | 'iconEmoji'> & {
    id?: string;
    iconEmoji?: string;
  },
): Promise<WorldEventDomain> {
  const now = new Date();
  const endTime = new Date(now.getTime() + input.duration * 60_000);

  const event: WorldEventDomain = {
    id:                   input.id ?? uuidv4(),
    type:                 input.type,
    title:                input.title,
    description:          input.description,
    affectedNeighborhoods: input.affectedNeighborhoods,
    economicImpact:       input.economicImpact,
    safetyImpact:         input.safetyImpact,
    duration:             input.duration,
    startTime:            now.toISOString(),
    endTime:              endTime.toISOString(),
    isActive:             true,
    sourceNews:           input.sourceNews,
    iconEmoji:            input.iconEmoji ?? eventIcon[input.type] ?? '📌',
  };

  const { error } = await supabase
    .from('world_events')
    .insert(domainToDb(event));

  if (error) {
    logger.error('[EventsService] Error saving event to DB', { error: error.message, title: event.title });
  }

  await applyEventToEconomy(event);

  // Broadcast
  try {
    const io = getIO();
    io.to('world').emit('world:event:new', event);
    for (const nid of event.affectedNeighborhoods) {
      io.to(`neighborhood:${nid}`).emit('world:event:new', event);
    }
  } catch {
    // io not yet initialised during tests
  }

  logger.info(`[EventsService] Created event "${event.title}" (${event.type})`);
  return event;
}

// ─────────────────────────────────────────────────────────────
// expireOldEvents
// ─────────────────────────────────────────────────────────────
export async function expireOldEvents(): Promise<void> {
  const now = new Date().toISOString();

  const { data: expired, error } = await supabase
    .from('world_events')
    .update({ is_active: false })
    .eq('is_active', true)
    .lt('end_time', now)
    .select();

  if (error) {
    logger.error('[EventsService] expireOldEvents error', { error: error.message });
    return;
  }

  if (!expired || expired.length === 0) return;

  logger.info(`[EventsService] Expired ${expired.length} event(s)`);

  try {
    const io = getIO();
    for (const row of expired as DbWorldEvent[]) {
      const payload = { id: row.id, type: row.type };
      io.to('world').emit('world:event:expired', payload);
      for (const nid of (row.affected_neighborhoods ?? [])) {
        io.to(`neighborhood:${nid}`).emit('world:event:expired', payload);
      }
    }
  } catch {
    // io not ready
  }
}

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────
export async function getActiveEvents(): Promise<WorldEventDomain[]> {
  const { data, error } = await supabase
    .from('world_events')
    .select('*')
    .eq('is_active', true)
    .order('start_time', { ascending: false });

  if (error) {
    logger.error('[EventsService] getActiveEvents error', { error: error.message });
    return [];
  }
  return ((data ?? []) as DbWorldEvent[]).map(dbToDomain);
}

export async function getEventById(id: string): Promise<WorldEventDomain | null> {
  const { data, error } = await supabase
    .from('world_events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error('[EventsService] getEventById error', { error: error.message, id });
    return null;
  }
  return dbToDomain(data as DbWorldEvent);
}

export async function getActiveEventsForNeighborhood(
  neighborhoodId: string,
): Promise<WorldEventDomain[]> {
  const { data, error } = await supabase
    .from('world_events')
    .select('*')
    .eq('is_active', true)
    .contains('affected_neighborhoods', [neighborhoodId])
    .order('start_time', { ascending: false });

  if (error) {
    logger.error('[EventsService] getActiveEventsForNeighborhood error', {
      error: error.message,
      neighborhoodId,
    });
    return [];
  }
  return ((data ?? []) as DbWorldEvent[]).map(dbToDomain);
}

// ─────────────────────────────────────────────────────────────
// generateRandomEvent
// ─────────────────────────────────────────────────────────────
interface RandomEventTemplate {
  type: WorldEventType;
  titles: string[];
  descriptions: string[];
  economicImpact: number;
  safetyImpact: number;
  durationRange: [number, number];
  scope: 'single' | 'all';
}

const RANDOM_EVENT_TEMPLATES: RandomEventTemplate[] = [
  {
    type: 'evento_cultural',
    titles: ['Festival de tango en el barrio', 'Feria de libros usados', 'Muestra de arte urbano'],
    descriptions: [
      'Artistas locales llenan las calles de música y color.',
      'Vecinos y turistas disfrutan de la cultura porteña.',
      'El barrio se viste de fiesta.',
    ],
    economicImpact: 20,
    safetyImpact: 5,
    durationRange: [60, 180],
    scope: 'single',
  },
  {
    type: 'operativo_policial',
    titles: [
      'Operativo de seguridad barrial',
      'Control vehicular en avenida',
      'Refuerzo de patrullaje nocturno',
    ],
    descriptions: [
      'Las fuerzas de seguridad despliegan un operativo preventivo.',
      'Se incrementa la presencia policial en la zona.',
      'Controles de tránsito y seguridad en el área.',
    ],
    economicImpact: 0,
    safetyImpact: 15,
    durationRange: [30, 90],
    scope: 'single',
  },
  {
    type: 'corte_servicio',
    titles: [
      'Corte de luz programado',
      'Interrupción del servicio de agua',
      'Falla en el gas de red',
    ],
    descriptions: [
      'Una empresa de servicios informa un corte técnico en la zona.',
      'El servicio se verá interrumpido por tareas de mantenimiento.',
      'Se estima la normalización en pocas horas.',
    ],
    economicImpact: -15,
    safetyImpact: -5,
    durationRange: [60, 180],
    scope: 'single',
  },
  {
    type: 'marcha',
    titles: [
      'Marcha vecinal por reclamos barriales',
      'Movilización estudiantil',
      'Protesta de trabajadores',
    ],
    descriptions: [
      'Vecinos se movilizan en reclamo de mejoras en el barrio.',
      'La marcha recorre las principales avenidas.',
      'Los manifestantes exigen respuestas a sus demandas.',
    ],
    economicImpact: -10,
    safetyImpact: -15,
    durationRange: [60, 120],
    scope: 'single',
  },
  {
    type: 'inflacion_pico',
    titles: [
      'Suba generalizada de precios en supermercados',
      'Remarcación masiva de productos básicos',
    ],
    descriptions: [
      'Los comercios actualizan sus precios ante la presión inflacionaria.',
      'El poder adquisitivo de los porteños sigue bajo presión.',
    ],
    economicImpact: -25,
    safetyImpact: -5,
    durationRange: [120, 180],
    scope: 'all',
  },
];

export async function generateRandomEvent(): Promise<WorldEventDomain | null> {
  try {
    const template = pickRandom(RANDOM_EVENT_TEMPLATES);
    const neighborhoods = allNeighborhoodIds();
    const affectedNeighborhoods =
      template.scope === 'all' ? neighborhoods : [pickRandom(neighborhoods)];

    return await createWorldEvent({
      type:                 template.type,
      title:                pickRandom(template.titles),
      description:          pickRandom(template.descriptions),
      affectedNeighborhoods,
      economicImpact:       template.economicImpact,
      safetyImpact:         template.safetyImpact,
      duration:             randomDuration(...template.durationRange),
    });
  } catch (err) {
    logger.error('[EventsService] generateRandomEvent error', {
      error: (err as Error).message,
    });
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// applyEventToEconomy
// ─────────────────────────────────────────────────────────────
export async function applyEventToEconomy(event: WorldEventDomain): Promise<void> {
  const impactFactor = event.economicImpact / 1000;

  economyState.globalModifier = clamp(economyState.globalModifier + impactFactor, 0.5, 3.0);

  if (event.type === 'dolar_salto' || event.type === 'crisis_economica') {
    const dollarShift = Math.abs(event.economicImpact) * 0.5;
    economyState.dollarRate = clamp(economyState.dollarRate + dollarShift, 800, 10_000);
  }

  economyState.inflationIndex += Math.max(0, -event.economicImpact);
  economyState.lastUpdated = new Date().toISOString();

  const { error } = await supabase
    .from('economy_state')
    .upsert({ id: 'global', ...economyState });

  if (error) {
    logger.warn('[EventsService] applyEventToEconomy DB write error', { error: error.message });
  }

  try {
    const io = getIO();
    io.to('world').emit('economy:update', economyState);
  } catch {
    // io not ready
  }
}

export function getEconomyState(): EconomyState {
  return { ...economyState };
}

// ─────────────────────────────────────────────────────────────
// Scheduler start / stop
// ─────────────────────────────────────────────────────────────
function scheduleNextRandomEvent(): void {
  const delayMs = randomDuration(60, 180) * 60_000; // 1-3 hours
  logger.debug(
    `[EventsService] Next random event in ${Math.round(delayMs / 60_000)} minutes`,
  );
  randomEventTimer = setTimeout(async () => {
    await generateRandomEvent();
    scheduleNextRandomEvent();
  }, delayMs);
}

export function startEventsEngine(): void {
  expireTimer = setInterval(async () => {
    await expireOldEvents();
  }, 5 * 60_000);

  void expireOldEvents(); // immediate first check

  scheduleNextRandomEvent();

  logger.info('[EventsService] Events engine started');
}

export function stopEventsEngine(): void {
  if (expireTimer) {
    clearInterval(expireTimer);
    expireTimer = null;
  }
  if (randomEventTimer) {
    clearTimeout(randomEventTimer);
    randomEventTimer = null;
  }
  logger.info('[EventsService] Events engine stopped');
}
