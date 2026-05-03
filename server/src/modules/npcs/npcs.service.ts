// ============================================================
// NPC SERVICE — CABA ONLINE
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';
import { getIO } from '../../websockets/ioInstance';
import { NEIGHBORHOODS, GAME_CONFIG } from '../../../../shared/constants';
import type { NPC, NpcType, MapPosition } from '../../../../shared/types';

// ── NPC templates per type ────────────────────────────────────
interface NpcTemplate {
  type: NpcType;
  names: string[];
  dialogue: string[];
  personality: number;
  interactions: Array<{
    id: string;
    label: string;
    requiredRole?: string;
    requiredReputation?: number;
    effect: { money?: number; reputation?: number };
    cooldownMinutes: number;
  }>;
  activeHours: [number, number];
}

const NPC_TEMPLATES: NpcTemplate[] = [
  {
    type: 'policia',
    names: ['Oficial Rodríguez', 'Agente González', 'Sargento Pérez', 'Oficial Martínez'],
    dialogue: [
      '¿Todo bien por acá?',
      'Circule, circule.',
      'Ningún problema mientras se porten bien.',
      'Seguimos vigilando el barrio.',
    ],
    personality: 20,
    activeHours: [8, 22],
    interactions: [
      {
        id: 'report_crime',
        label: 'Reportar actividad sospechosa',
        effect: { reputation: 5 },
        cooldownMinutes: 60,
      },
      {
        id: 'ask_safety',
        label: 'Preguntar por seguridad del barrio',
        effect: { reputation: 2 },
        cooldownMinutes: 30,
      },
    ],
  },
  {
    type: 'comerciante',
    names: ['Don Héctor', 'La Tía Marta', 'Señor Kim', 'Doña Elena', 'El Turco Miguel'],
    dialogue: [
      '¡Llevá dos por el precio de uno!',
      'Hoy hay descuentos para los del barrio.',
      'Se me vino el proveedor tarde, pero estamos.',
      'Cada día más caro todo, pero acá estamos.',
    ],
    personality: 60,
    activeHours: [9, 20],
    interactions: [
      {
        id: 'buy_supplies',
        label: 'Comprar insumos básicos',
        effect: { money: -500, reputation: 3 },
        cooldownMinutes: 120,
      },
      {
        id: 'offer_delivery',
        label: 'Ofrecer hacer un delivery',
        requiredRole: 'repartidor',
        effect: { money: 800, reputation: 2 },
        cooldownMinutes: 30,
      },
    ],
  },
  {
    type: 'vecino',
    names: ['Ramón', 'Susana', 'Carlitos', 'Norma', 'El Toto', 'La Caro'],
    dialogue: [
      'Buen día, ¿cómo andás?',
      'Este barrio ya no es lo que era…',
      '¿Sabés dónde queda la ferretería?',
      'Hoy sale el subte, pero tarde como siempre.',
    ],
    personality: 40,
    activeHours: [7, 23],
    interactions: [
      {
        id: 'help_vecino',
        label: 'Ayudar con una tarea',
        effect: { reputation: 5, money: 200 },
        cooldownMinutes: 45,
      },
      {
        id: 'chat',
        label: 'Charlar un rato',
        effect: { reputation: 1 },
        cooldownMinutes: 15,
      },
    ],
  },
  {
    type: 'puntero',
    names: ['El Colo', 'La Nena Gómez', 'Mister Pedraza', 'Tío Rubén'],
    dialogue: [
      'Si necesitás algo, ya sabés dónde encontrarme.',
      'El barrio se mueve como yo digo.',
      'Tengo contactos en todos lados.',
    ],
    personality: -20,
    activeHours: [10, 22],
    interactions: [
      {
        id: 'ask_favor',
        label: 'Pedir un favor',
        requiredReputation: 30,
        effect: { money: 1500, reputation: -5 },
        cooldownMinutes: 180,
      },
    ],
  },
  {
    type: 'periodista',
    names: ['Valeria Soto', 'Marcos Ibarra', 'Lic. Fernández'],
    dialogue: [
      '¿Tenés algo interesante para contarme?',
      'Estoy investigando un tema que afecta al barrio.',
      'La gente tiene derecho a saber.',
    ],
    personality: 30,
    activeHours: [9, 21],
    interactions: [
      {
        id: 'give_info',
        label: 'Compartir información',
        requiredRole: 'periodista',
        effect: { reputation: 10, money: 500 },
        cooldownMinutes: 120,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function jitterPosition(base: MapPosition, radius = 0.003): MapPosition {
  return {
    lat: base.lat + (Math.random() - 0.5) * radius * 2,
    lng: base.lng + (Math.random() - 0.5) * radius * 2,
  };
}

function buildNPC(neighborhoodId: string, template: NpcTemplate): NPC {
  const meta = NEIGHBORHOODS[neighborhoodId];
  const basePos = meta?.center ?? { lat: -34.6037, lng: -58.3816 };
  return {
    id:            uuidv4(),
    name:          pickRandom(template.names),
    type:          template.type,
    position:      jitterPosition(basePos),
    neighborhoodId,
    dialogue:      template.dialogue,
    interactions:  template.interactions,
    personality:   template.personality,
    schedule: {
      activeHours: template.activeHours,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// initializeNPCs
// ─────────────────────────────────────────────────────────────
export async function initializeNPCs(): Promise<void> {
  logger.info('[NPCService] Initialising NPCs…');
  const npcs: NPC[] = [];

  for (const neighborhoodId of Object.keys(NEIGHBORHOODS)) {
    for (let i = 0; i < GAME_CONFIG.npcCountPerNeighborhood; i++) {
      const template = pickRandom(NPC_TEMPLATES);
      npcs.push(buildNPC(neighborhoodId, template));
    }
  }

  // Upsert all NPCs — use truncate+insert pattern for simplicity
  const { error } = await supabase.from('npcs').upsert(npcs, { onConflict: 'id' });
  if (error) {
    logger.error(`[NPCService] initializeNPCs DB error: ${error.message}`);
    return;
  }

  logger.info(`[NPCService] Initialised ${npcs.length} NPCs across ${Object.keys(NEIGHBORHOODS).length} neighbourhoods`);
}

// ─────────────────────────────────────────────────────────────
// updateNPCPositions — called every 5 minutes
// ─────────────────────────────────────────────────────────────
export async function updateNPCPositions(): Promise<void> {
  const { data: npcs, error } = await supabase
    .from('npcs')
    .select('id, position, neighborhoodId');

  if (error || !npcs) {
    logger.error(`[NPCService] updateNPCPositions fetch error: ${error?.message}`);
    return;
  }

  // Move each NPC a small amount
  const updates = (npcs as Array<{ id: string; position: MapPosition; neighborhoodId: string }>).map(
    (npc) => ({
      id:       npc.id,
      position: jitterPosition(npc.position, 0.001),
    }),
  );

  // Batch updates — Supabase doesn't support bulk partial updates easily,
  // so we use individual promises but limit concurrency
  const batchSize = 20;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map((u) =>
        supabase.from('npcs').update({ position: u.position }).eq('id', u.id),
      ),
    );
  }

  // Broadcast NPC positions to all connected clients per neighbourhood
  try {
    const io = getIO();
    // Group by neighbourhood
    const byNeighbourhood: Record<string, typeof updates> = {};
    for (let i = 0; i < updates.length; i++) {
      const npc = npcs[i] as { id: string; position: MapPosition; neighborhoodId: string };
      const nid = npc.neighborhoodId;
      if (!byNeighbourhood[nid]) byNeighbourhood[nid] = [];
      byNeighbourhood[nid].push(updates[i]);
    }

    for (const [nid, positions] of Object.entries(byNeighbourhood)) {
      io.to(`neighborhood:${nid}`).emit('npc:update', positions);
    }
  } catch {
    // io not ready
  }

  logger.debug(`[NPCService] Updated positions for ${updates.length} NPCs`);
}

// ─────────────────────────────────────────────────────────────
// getNPCsForNeighborhood
// ─────────────────────────────────────────────────────────────
export async function getNPCsForNeighborhood(neighborhoodId: string): Promise<NPC[]> {
  const { data, error } = await supabase
    .from('npcs')
    .select('*')
    .eq('neighborhoodId', neighborhoodId);

  if (error) {
    logger.error(`[NPCService] getNPCsForNeighborhood error: ${error.message}`);
    return [];
  }
  return (data as NPC[]) ?? [];
}

export async function getAllNPCs(): Promise<NPC[]> {
  const { data, error } = await supabase.from('npcs').select('*');
  if (error) {
    logger.error(`[NPCService] getAllNPCs error: ${error.message}`);
    return [];
  }
  return (data as NPC[]) ?? [];
}

// ─────────────────────────────────────────────────────────────
// interactWithNPC
// ─────────────────────────────────────────────────────────────

// Cooldown tracking: Map<`${userId}:${npcId}:${interactionId}`, expiresAt>
const interactionCooldowns = new Map<string, number>();

interface InteractionResult {
  success: boolean;
  message: string;
  effects?: { money?: number; reputation?: number };
  cooldownRemainingSeconds?: number;
}

export async function interactWithNPC(
  userId: string,
  npcId: string,
  interactionId: string,
): Promise<InteractionResult> {
  const cooldownKey = `${userId}:${npcId}:${interactionId}`;
  const now = Date.now();

  const cooldownExpiry = interactionCooldowns.get(cooldownKey);
  if (cooldownExpiry && now < cooldownExpiry) {
    const remaining = Math.ceil((cooldownExpiry - now) / 1000);
    return {
      success: false,
      message: `Espera ${remaining}s antes de volver a interactuar`,
      cooldownRemainingSeconds: remaining,
    };
  }

  // Fetch NPC
  const { data: npc, error } = await supabase
    .from('npcs')
    .select('*')
    .eq('id', npcId)
    .single();

  if (error || !npc) {
    return { success: false, message: 'NPC no encontrado' };
  }

  const npcData = npc as NPC;
  const interaction = npcData.interactions.find((i) => i.id === interactionId);
  if (!interaction) {
    return { success: false, message: 'Interacción no disponible' };
  }

  // Fetch user for role/reputation checks
  const { data: user } = await supabase
    .from('users')
    .select('roleId, reputation')
    .eq('id', userId)
    .single();

  if (interaction.requiredReputation && user?.reputation < interaction.requiredReputation) {
    return {
      success: false,
      message: `Necesitás al menos ${interaction.requiredReputation} de reputación`,
    };
  }

  if (interaction.requiredRole && user?.roleId !== interaction.requiredRole) {
    return {
      success: false,
      message: `Solo disponible para rol: ${interaction.requiredRole}`,
    };
  }

  // Apply effects
  const effects = interaction.effect;
  const updates: Record<string, unknown> = {};
  if (effects.money) updates['balance'] = supabase.rpc as unknown; // handled via RPC or manual
  if (effects.reputation) updates['reputation'] = (user?.reputation ?? 50) + (effects.reputation ?? 0);

  if (Object.keys(updates).length > 0) {
    // Apply reputation change
    if (effects.reputation) {
      await supabase
        .from('users')
        .update({ reputation: Math.max(0, Math.min(100, (user?.reputation ?? 50) + effects.reputation)) })
        .eq('id', userId);
    }

    // Apply money change via transactions table
    if (effects.money) {
      await supabase.from('transactions').insert({
        id:          uuidv4(),
        userId,
        amount:      effects.money,
        type:        effects.money > 0 ? 'reward' : 'expense',
        description: `Interacción con ${npcData.name}: ${interaction.label}`,
        createdAt:   new Date().toISOString(),
      });
    }
  }

  // Set cooldown
  interactionCooldowns.set(cooldownKey, now + interaction.cooldownMinutes * 60_000);

  return {
    success: true,
    message: `Interacción completada: ${interaction.label}`,
    effects: { money: effects.money, reputation: effects.reputation },
  };
}

// ─────────────────────────────────────────────────────────────
// Scheduler
// ─────────────────────────────────────────────────────────────
let npcUpdateTimer: ReturnType<typeof setInterval> | null = null;

export function startNPCScheduler(): void {
  npcUpdateTimer = setInterval(async () => {
    await updateNPCPositions();
  }, 5 * 60_000);
  logger.info('[NPCService] NPC position scheduler started (every 5 min)');
}

export function stopNPCScheduler(): void {
  if (npcUpdateTimer) {
    clearInterval(npcUpdateTimer);
    npcUpdateTimer = null;
  }
}
