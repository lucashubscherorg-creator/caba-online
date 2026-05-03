// ============================================
// CONSTANTES GLOBALES — CABA ONLINE
// ============================================

export const CABA_BOUNDS = {
  north: -34.527,
  south: -34.705,
  east: -58.335,
  west: -58.531,
  center: { lat: -34.6037, lng: -58.3816 },
};

export const NEIGHBORHOODS: Record<string, { name: string; center: { lat: number; lng: number }; safetyLevel: number; wealthLevel: number }> = {
  palermo:        { name: 'Palermo',        center: { lat: -34.5752, lng: -58.4260 }, safetyLevel: 8, wealthLevel: 9 },
  recoleta:       { name: 'Recoleta',       center: { lat: -34.5882, lng: -58.3940 }, safetyLevel: 9, wealthLevel: 10 },
  belgrano:       { name: 'Belgrano',       center: { lat: -34.5626, lng: -58.4580 }, safetyLevel: 8, wealthLevel: 9 },
  san_telmo:      { name: 'San Telmo',      center: { lat: -34.6218, lng: -58.3730 }, safetyLevel: 6, wealthLevel: 5 },
  la_boca:        { name: 'La Boca',        center: { lat: -34.6360, lng: -58.3630 }, safetyLevel: 4, wealthLevel: 3 },
  once:           { name: 'Once',           center: { lat: -34.6080, lng: -58.4100 }, safetyLevel: 5, wealthLevel: 5 },
  microcentro:    { name: 'Microcentro',    center: { lat: -34.6083, lng: -58.3712 }, safetyLevel: 7, wealthLevel: 7 },
  caballito:      { name: 'Caballito',      center: { lat: -34.6196, lng: -58.4416 }, safetyLevel: 7, wealthLevel: 6 },
  villa_crespo:   { name: 'Villa Crespo',   center: { lat: -34.5992, lng: -58.4395 }, safetyLevel: 7, wealthLevel: 6 },
  floresta:       { name: 'Floresta',       center: { lat: -34.6278, lng: -58.4784 }, safetyLevel: 5, wealthLevel: 4 },
  mataderos:      { name: 'Mataderos',      center: { lat: -34.6651, lng: -58.5160 }, safetyLevel: 4, wealthLevel: 3 },
  villa_lugano:   { name: 'Villa Lugano',   center: { lat: -34.6823, lng: -58.4842 }, safetyLevel: 3, wealthLevel: 2 },
  villa_soldati:  { name: 'Villa Soldati',  center: { lat: -34.6743, lng: -58.4567 }, safetyLevel: 3, wealthLevel: 2 },
  constitucion:   { name: 'Constitución',   center: { lat: -34.6268, lng: -58.3842 }, safetyLevel: 4, wealthLevel: 4 },
  barracas:       { name: 'Barracas',       center: { lat: -34.6455, lng: -58.3895 }, safetyLevel: 5, wealthLevel: 4 },
  flores:         { name: 'Flores',         center: { lat: -34.6308, lng: -58.4631 }, safetyLevel: 6, wealthLevel: 5 },
  almagro:        { name: 'Almagro',        center: { lat: -34.6096, lng: -58.4227 }, safetyLevel: 7, wealthLevel: 6 },
  boedo:          { name: 'Boedo',          center: { lat: -34.6270, lng: -58.4180 }, safetyLevel: 6, wealthLevel: 5 },
  parque_chacabuco: { name: 'Parque Chacabuco', center: { lat: -34.6444, lng: -58.4404 }, safetyLevel: 6, wealthLevel: 5 },
  nueva_pompeya:  { name: 'Nueva Pompeya',  center: { lat: -34.6571, lng: -58.4207 }, safetyLevel: 4, wealthLevel: 3 },
  parque_patricios: { name: 'Parque Patricios', center: { lat: -34.6426, lng: -58.4062 }, safetyLevel: 5, wealthLevel: 4 },
  liniers:        { name: 'Liniers',        center: { lat: -34.6474, lng: -58.5208 }, safetyLevel: 5, wealthLevel: 4 },
  villa_del_parque: { name: 'Villa del Parque', center: { lat: -34.6074, lng: -58.4843 }, safetyLevel: 7, wealthLevel: 6 },
  monte_castro:   { name: 'Monte Castro',   center: { lat: -34.6185, lng: -58.5002 }, safetyLevel: 6, wealthLevel: 5 },
  villa_real:     { name: 'Villa Real',     center: { lat: -34.6268, lng: -58.5162 }, safetyLevel: 5, wealthLevel: 4 },
  versalles:      { name: 'Versalles',      center: { lat: -34.6368, lng: -58.5212 }, safetyLevel: 6, wealthLevel: 5 },
  villa_luro:     { name: 'Villa Luro',     center: { lat: -34.6368, lng: -58.5003 }, safetyLevel: 6, wealthLevel: 5 },
  devoto:         { name: 'Villa Devoto',   center: { lat: -34.5958, lng: -58.5100 }, safetyLevel: 7, wealthLevel: 6 },
  villa_pueyrredon: { name: 'Villa Pueyrredón', center: { lat: -34.5809, lng: -58.4935 }, safetyLevel: 7, wealthLevel: 6 },
  villa_urquiza:  { name: 'Villa Urquiza',  center: { lat: -34.5749, lng: -58.4837 }, safetyLevel: 7, wealthLevel: 7 },
  saavedra:       { name: 'Saavedra',       center: { lat: -34.5514, lng: -58.4832 }, safetyLevel: 8, wealthLevel: 7 },
  coghlan:        { name: 'Coghlan',        center: { lat: -34.5591, lng: -58.4687 }, safetyLevel: 8, wealthLevel: 7 },
  colegiales:     { name: 'Colegiales',     center: { lat: -34.5761, lng: -58.4453 }, safetyLevel: 8, wealthLevel: 7 },
  nunez:          { name: 'Núñez',          center: { lat: -34.5448, lng: -58.4621 }, safetyLevel: 8, wealthLevel: 8 },
  chacarita:      { name: 'Chacarita',      center: { lat: -34.5870, lng: -58.4557 }, safetyLevel: 7, wealthLevel: 6 },
  parque_chas:    { name: 'Parque Chas',    center: { lat: -34.5842, lng: -58.4688 }, safetyLevel: 7, wealthLevel: 6 },
  agronomia:      { name: 'Agronomía',      center: { lat: -34.5953, lng: -58.4928 }, safetyLevel: 7, wealthLevel: 5 },
  paternal:       { name: 'Paternal',       center: { lat: -34.5984, lng: -58.4660 }, safetyLevel: 6, wealthLevel: 5 },
  villa_santa_rita: { name: 'Villa Santa Rita', center: { lat: -34.6136, lng: -58.4942 }, safetyLevel: 6, wealthLevel: 5 },
  puerto_madero:  { name: 'Puerto Madero',  center: { lat: -34.6158, lng: -58.3635 }, safetyLevel: 9, wealthLevel: 10 },
  retiro:         { name: 'Retiro',         center: { lat: -34.5898, lng: -58.3748 }, safetyLevel: 6, wealthLevel: 7 },
  san_nicolas:    { name: 'San Nicolás',    center: { lat: -34.6048, lng: -58.3748 }, safetyLevel: 7, wealthLevel: 7 },
  monserrat:      { name: 'Monserrat',      center: { lat: -34.6162, lng: -58.3783 }, safetyLevel: 6, wealthLevel: 6 },
  balvanera:      { name: 'Balvanera',      center: { lat: -34.6142, lng: -58.4048 }, safetyLevel: 5, wealthLevel: 5 },
  san_cristobal:  { name: 'San Cristóbal',  center: { lat: -34.6265, lng: -58.4002 }, safetyLevel: 5, wealthLevel: 5 },
  boca:           { name: 'La Boca',        center: { lat: -34.6360, lng: -58.3630 }, safetyLevel: 4, wealthLevel: 3 },
  pompeya:        { name: 'Nueva Pompeya',  center: { lat: -34.6571, lng: -58.4207 }, safetyLevel: 4, wealthLevel: 3 },
  villa_ortuzar:  { name: 'Villa Ortúzar',  center: { lat: -34.5808, lng: -58.4761 }, safetyLevel: 7, wealthLevel: 6 },
};

export const GAME_CONFIG = {
  startingBalance: 50000,        // pesos virtuales
  startingReputation: 50,
  maxLevel: 100,
  xpPerLevel: 1000,
  newsRefreshMinutes: 30,
  missionExpiryHours: 24,
  npcCountPerNeighborhood: 5,
  maxPlayersPerRoom: 50,
  economyUpdateMinutes: 15,
};

export const DOLLAR_BASE_RATE = 1200; // pesos por dólar base (varía con eventos)

export const RSS_FEEDS = [
  { name: 'Infobae', url: 'https://www.infobae.com/feeds/rss/', category: 'general' },
  { name: 'Clarín', url: 'https://www.clarin.com/rss/lo-ultimo/', category: 'general' },
  { name: 'La Nación', url: 'https://www.lanacion.com.ar/arcio/rss/', category: 'general' },
  { name: 'Página 12', url: 'https://www.pagina12.com.ar/rss/portada', category: 'general' },
  { name: 'Ambito', url: 'https://www.ambito.com/rss.html', category: 'economy' },
];

export const NEWS_KEYWORDS: Record<string, { eventType: string; economicImpact: number; safetyImpact: number }> = {
  'inflación':      { eventType: 'inflacion_pico',      economicImpact: -30, safetyImpact: -5 },
  'dólar':          { eventType: 'dolar_salto',          economicImpact: -20, safetyImpact: 0 },
  'marcha':         { eventType: 'marcha',               economicImpact: -5,  safetyImpact: -15 },
  'paro':           { eventType: 'paro',                 economicImpact: -25, safetyImpact: -10 },
  'protesta':       { eventType: 'marcha',               economicImpact: -10, safetyImpact: -20 },
  'corte de luz':   { eventType: 'corte_servicio',       economicImpact: -15, safetyImpact: -5 },
  'operativo':      { eventType: 'operativo_policial',   economicImpact: 0,   safetyImpact: 10 },
  'elecciones':     { eventType: 'elecciones',           economicImpact: -10, safetyImpact: -5 },
  'festival':       { eventType: 'evento_cultural',      economicImpact: 15,  safetyImpact: 5 },
  'recital':        { eventType: 'evento_cultural',      economicImpact: 20,  safetyImpact: 0 },
  'crisis':         { eventType: 'crisis_economica',     economicImpact: -40, safetyImpact: -15 },
  'devaluación':    { eventType: 'dolar_salto',          economicImpact: -35, safetyImpact: -5 },
  'aumento':        { eventType: 'inflacion_pico',       economicImpact: -15, safetyImpact: -5 },
  'subsidios':      { eventType: 'crisis_economica',     economicImpact: -10, safetyImpact: 0 },
  'tarifazo':       { eventType: 'corte_servicio',       economicImpact: -20, safetyImpact: -5 },
};
