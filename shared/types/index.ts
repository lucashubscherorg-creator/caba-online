// ============================================
// TIPOS COMPARTIDOS — CABA ONLINE
// ============================================

// --- USUARIO ---
export interface User {
  id: string;
  username: string;
  email: string;
  roleId: string;
  neighborhoodId: string;
  balance: number;
  reputation: number;
  level: number;
  skills: UserSkills;
  isOnline: boolean;
  position: MapPosition;
  createdAt: string;
  updatedAt: string;
}

export interface UserSkills {
  street: number;      // habilidad en la calle
  social: number;      // habilidad social / negociación
  technical: number;   // habilidad técnica
  physical: number;    // habilidad física
  intelligence: number;
}

// --- ROL ---
export type RoleCategory =
  | 'formal'         // empleos formales
  | 'informal'       // changas, economía informal
  | 'illegal'        // actividades ilegales (mecánicas abstractas)
  | 'service'        // servicios (médico, policia, bombero)
  | 'political'      // político, funcionario
  | 'media'          // periodista, influencer
  | 'special';       // roles especiales desbloqueables

export interface Role {
  id: string;
  name: string;
  description: string;
  category: RoleCategory;
  baseIncome: number;         // ingresos base por hora de juego
  incomeVariance: number;     // % de variación aleatoria
  requiredSkills: Partial<UserSkills>;
  unlockLevel: number;
  riskLevel: number;          // 0-10
  legalStatus: 'legal' | 'gray' | 'illegal';
  availableZones: string[];   // IDs de barrios donde aplica
  mechanics: RoleMechanic[];
}

export interface RoleMechanic {
  id: string;
  name: string;
  description: string;
  cooldownMinutes: number;
  successRate: number;
  rewardRange: [number, number];
  riskOnFail: string;
}

// --- MAPA ---
export interface MapPosition {
  lat: number;
  lng: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  zone: 'norte' | 'sur' | 'este' | 'oeste' | 'centro';
  safetyLevel: number;   // 0-10 (10 = más seguro)
  wealthLevel: number;   // 0-10 (10 = más rico)
  bounds: MapPosition[];
  center: MapPosition;
  activeEvents: string[];
}

// --- MISIÓN / PROBLEMÁTICA ---
export type MissionType =
  | 'personal'
  | 'cooperative'
  | 'competitive'
  | 'crisis'
  | 'news_event';

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  targetUsers: string[];       // IDs de usuarios involucrados
  requiredRoles?: string[];
  location: MapPosition;
  neighborhoodId: string;
  reward: MissionReward;
  penalty: MissionPenalty;
  timeLimit: number;           // minutos
  difficulty: number;          // 1-10
  steps: MissionStep[];
  status: 'pending' | 'active' | 'completed' | 'failed' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface MissionStep {
  id: string;
  description: string;
  action: string;
  completed: boolean;
}

export interface MissionReward {
  money: number;
  reputation: number;
  skillPoints: Partial<UserSkills>;
  unlocks?: string[];
}

export interface MissionPenalty {
  money: number;
  reputation: number;
  riskType?: 'arrest' | 'injury' | 'debt' | 'none';
}

// --- EVENTO MUNDIAL ---
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

export interface WorldEvent {
  id: string;
  type: WorldEventType;
  title: string;
  description: string;
  affectedNeighborhoods: string[];
  economicImpact: number;       // -100 a +100
  safetyImpact: number;         // -100 a +100
  duration: number;             // minutos
  startTime: string;
  endTime: string;
  isActive: boolean;
  sourceNews?: string;          // URL o título de la noticia real
  iconEmoji: string;
}

// --- NPC ---
export type NpcType =
  | 'policia'
  | 'comerciante'
  | 'vecino'
  | 'puntero'
  | 'funcionario'
  | 'periodista'
  | 'manifestante';

export interface NPC {
  id: string;
  name: string;
  type: NpcType;
  position: MapPosition;
  neighborhoodId: string;
  dialogue: string[];
  interactions: NpcInteraction[];
  personality: number;          // -100 (hostil) a +100 (amigable)
  schedule: NpcSchedule;
}

export interface NpcInteraction {
  id: string;
  label: string;
  requiredRole?: string;
  requiredReputation?: number;
  effect: Partial<MissionReward>;
  cooldownMinutes: number;
}

export interface NpcSchedule {
  activeHours: [number, number]; // [inicio, fin] hora del día del juego
  patrolPath?: MapPosition[];
}

// --- WEBSOCKET EVENTOS ---
export type SocketEvent =
  | 'user:join'
  | 'user:leave'
  | 'user:move'
  | 'mission:new'
  | 'mission:update'
  | 'world:event'
  | 'economy:update'
  | 'chat:message'
  | 'npc:move';

export interface SocketPayload<T = unknown> {
  event: SocketEvent;
  data: T;
  timestamp: string;
}

// --- API RESPUESTAS ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

// --- ECONOMÍA ---
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense' | 'penalty' | 'reward';
  description: string;
  createdAt: string;
}

export interface MarketPrice {
  item: string;
  basePrice: number;
  currentPrice: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}
