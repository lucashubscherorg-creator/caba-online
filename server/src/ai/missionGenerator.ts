// ============================================
// MOTOR DE GENERACIÓN DE MISIONES — CABA ONLINE
// IA Procedural propia: templates + randomización + estado del mundo
// ============================================

import { v4 as uuidv4 } from 'uuid';
import {
  Mission,
  MissionType,
  MissionStep,
  MissionReward,
  MissionPenalty,
  UserSkills,
} from '@shared/types';
import { NEIGHBORHOODS, GAME_CONFIG } from '@shared/constants';

// ============================================
// TIPOS INTERNOS
// ============================================

export interface MissionContext {
  neighborhoodId: string;
  userRole: string;
  userLevel: number;
  userSkills: UserSkills;
  userBalance: number;
  activeEvents: string[];       // IDs de eventos activos
  timeOfDay: 'morning' | 'afternoon' | 'night';
  dollarRate: number;
  inflationIndex: number;       // 0-200, base 100
  worldSafetyLevel: number;     // 0-10
}

interface MissionTemplate {
  id: string;
  titleTemplate: string;
  descriptionTemplate: string;
  type: MissionType;
  categories: string[];         // roles que pueden recibirla (vacío = todos)
  requiredEvents?: string[];    // eventos que deben estar activos
  forbiddenEvents?: string[];   // eventos que NO deben estar activos
  baseRewardMoney: number;
  baseRewardRep: number;
  basePenaltyMoney: number;
  basePenaltyRep: number;
  baseDifficulty: number;
  timeLimit: number;            // minutos
  riskType: 'arrest' | 'injury' | 'debt' | 'none';
  stepTemplates: string[];
  tags: string[];
}

// ============================================
// POOL DE 60 TEMPLATES DE MISIONES
// ============================================

const MISSION_TEMPLATES: MissionTemplate[] = [
  // --- CRISIS DE SERVICIOS ---
  {
    id: 'corte_luz_velas',
    titleTemplate: 'Corte de luz en {barrio}',
    descriptionTemplate:
      'Hay un corte de luz en {barrio}. Conseguí velas o un generador antes de que anochezca. Los negocios del barrio están desesperados.',
    type: 'crisis',
    categories: [],
    requiredEvents: ['corte_servicio'],
    baseRewardMoney: 8000,
    baseRewardRep: 10,
    basePenaltyMoney: 2000,
    basePenaltyRep: 5,
    baseDifficulty: 3,
    timeLimit: 45,
    riskType: 'none',
    stepTemplates: [
      'Conseguí al menos 10 velas o una fuente de luz de emergencia',
      'Llevá el material al punto de distribución en {barrio}',
      'Cobrale a los vecinos o dejalo gratis para ganar reputación',
    ],
    tags: ['crisis', 'servicio', 'comunidad'],
  },
  {
    id: 'corte_agua',
    titleTemplate: 'Sin agua en {barrio}',
    descriptionTemplate:
      'Aysa cortó el agua en {barrio} por mantenimiento. Los vecinos necesitan bidones. Hay plata en esto.',
    type: 'crisis',
    categories: [],
    baseRewardMoney: 12000,
    baseRewardRep: 8,
    basePenaltyMoney: 0,
    basePenaltyRep: 3,
    baseDifficulty: 3,
    timeLimit: 60,
    riskType: 'none',
    stepTemplates: [
      'Conseguí al menos 5 bidones de agua',
      'Distribuílos por el barrio o vendelos con recargo',
    ],
    tags: ['crisis', 'servicio', 'agua'],
  },
  {
    id: 'corte_gas_invierno',
    titleTemplate: 'Sin gas en pleno invierno — {barrio}',
    descriptionTemplate:
      'Metrogas cortó el suministro en {barrio}. Con este frío, los vecinos necesitan soluciones urgentes. Calefactores eléctricos, leña, lo que sea.',
    type: 'crisis',
    categories: [],
    baseRewardMoney: 15000,
    baseRewardRep: 12,
    basePenaltyMoney: 0,
    basePenaltyRep: 5,
    baseDifficulty: 4,
    timeLimit: 90,
    riskType: 'none',
    stepTemplates: [
      'Conseguí calefactores alternativos o leña',
      'Avisale a los vecinos más vulnerables del barrio',
      'Entregá el material antes de que baje la temperatura',
    ],
    tags: ['crisis', 'gas', 'invierno'],
  },

  // --- ECONÓMICAS ---
  {
    id: 'casero_dolar',
    titleTemplate: 'El casero quiere cobrar en dólares',
    descriptionTemplate:
      'El dólar subió un {porcentaje}% esta semana. Tu casero quiere cobrar el alquiler en dólares. Negociá o conseguí los fondos antes del {fecha}.',
    type: 'personal',
    categories: [],
    requiredEvents: ['dolar_salto'],
    baseRewardMoney: 20000,
    baseRewardRep: 15,
    basePenaltyMoney: 30000,
    basePenaltyRep: 20,
    baseDifficulty: 6,
    timeLimit: 120,
    riskType: 'debt',
    stepTemplates: [
      'Negociá con el casero (requiere skill social)',
      'Conseguí los dólares al blue o al oficial',
      'Pagá el alquiler o firmá un acuerdo de cuotas',
    ],
    tags: ['economia', 'dolar', 'alquiler', 'personal'],
  },
  {
    id: 'multa_transito',
    titleTemplate: 'Multa de tránsito por ${monto}',
    descriptionTemplate:
      'Te llegó una multa de tránsito de ${monto}. Tenés 10 días para pagarla o apelar. Un abogado podría ayudarte a bajarla.',
    type: 'personal',
    categories: [],
    baseRewardMoney: 5000,
    baseRewardRep: 5,
    basePenaltyMoney: 15000,
    basePenaltyRep: 10,
    baseDifficulty: 2,
    timeLimit: 180,
    riskType: 'debt',
    stepTemplates: [
      'Decidí si pagar o apelar la multa',
      'Si apelás: conseguí un abogado o usá el sistema online',
      'Cerrá el trámite antes del vencimiento',
    ],
    tags: ['multa', 'transito', 'burocracia'],
  },
  {
    id: 'prestamo_banco',
    titleTemplate: 'Tramitar préstamo en el banco',
    descriptionTemplate:
      'Necesitás un préstamo pero los bancos tienen cola de dos horas y piden mil papeles. Ayudá a {NPC} o tramitá el tuyo.',
    type: 'personal',
    categories: [],
    baseRewardMoney: 6000,
    baseRewardRep: 8,
    basePenaltyMoney: 0,
    basePenaltyRep: 10,
    baseDifficulty: 3,
    timeLimit: 90,
    riskType: 'none',
    stepTemplates: [
      'Conseguí los documentos requeridos (DNI, recibo de sueldo, constancia AFIP)',
      'Esperá tu turno en el banco de {barrio}',
      'Completá el formulario sin errores y entregalo',
    ],
    tags: ['banco', 'tramite', 'burocracia'],
  },
  {
    id: 'deuda_tarjeta',
    titleTemplate: 'Vencimiento de tarjeta de crédito',
    descriptionTemplate:
      'Se vence el resumen de tu tarjeta con un mínimo de ${monto}. Si no pagás, el interés te come. Conseguí la plata como sea.',
    type: 'personal',
    categories: [],
    baseRewardMoney: 3000,
    baseRewardRep: 5,
    basePenaltyMoney: 25000,
    basePenaltyRep: 15,
    baseDifficulty: 4,
    timeLimit: 60,
    riskType: 'debt',
    stepTemplates: [
      'Calculá cuánto necesitás juntar',
      'Realizá ingresos extras para cubrir el mínimo',
      'Pagá la tarjeta antes del vencimiento',
    ],
    tags: ['deuda', 'tarjeta', 'economia'],
  },

  // --- TRABAJO Y CHANGAS ---
  {
    id: 'changa_urgente',
    titleTemplate: 'Changa urgente en {barrio}',
    descriptionTemplate:
      'Hay trabajo de {tipo_trabajo} en {barrio}. Llegá primero antes que otros jugadores se lo lleven. Pagan en efectivo.',
    type: 'competitive',
    categories: [],
    baseRewardMoney: 10000,
    baseRewardRep: 7,
    basePenaltyMoney: 0,
    basePenaltyRep: 0,
    baseDifficulty: 3,
    timeLimit: 30,
    riskType: 'none',
    stepTemplates: [
      'Llegá a {barrio} antes que los demás jugadores',
      'Completá la tarea asignada',
      'Cobrá el pago acordado',
    ],
    tags: ['changa', 'competitivo', 'trabajo'],
  },
  {
    id: 'mudanza_rapida',
    titleTemplate: 'Mudanza exprés en {barrio}',
    descriptionTemplate:
      'Un vecino de {barrio} necesita una mudanza urgente. Tiene pocos muebles pero apura. Juntá gente o hacelo solo si sos fuerte.',
    type: 'cooperative',
    categories: ['albañil', 'changarín', 'delivery_independiente'],
    baseRewardMoney: 18000,
    baseRewardRep: 6,
    basePenaltyMoney: 0,
    basePenaltyRep: 3,
    baseDifficulty: 3,
    timeLimit: 120,
    riskType: 'injury',
    stepTemplates: [
      'Juntá al menos 2 personas para la mudanza',
      'Cargá los muebles con cuidado',
      'Entregá todo en el nuevo destino',
    ],
    tags: ['mudanza', 'fisico', 'cooperativo'],
  },
  {
    id: 'reparacion_emergencia',
    titleTemplate: 'Reparación urgente — {tipo_reparacion}',
    descriptionTemplate:
      'Se rompió {tipo_reparacion} en un edificio de {barrio}. El encargado paga bien pero necesita solución ya.',
    type: 'personal',
    categories: ['electricista', 'plomero', 'gasista', 'albañil', 'mecánico'],
    baseRewardMoney: 22000,
    baseRewardRep: 10,
    basePenaltyMoney: 0,
    basePenaltyRep: 8,
    baseDifficulty: 5,
    timeLimit: 60,
    riskType: 'injury',
    stepTemplates: [
      'Evaluá el daño y calculá el presupuesto',
      'Conseguí los materiales necesarios',
      'Completá la reparación correctamente',
    ],
    tags: ['reparacion', 'tecnico', 'urgente'],
  },

  // --- PROTESTAS Y EVENTOS POLÍTICOS ---
  {
    id: 'vender_en_marcha',
    titleTemplate: 'Marcha en {barrio} — Oportunidad de venta',
    descriptionTemplate:
      'Hay una marcha en {barrio}. Miles de personas en la calle es un negocio. Armá tu puesto de comida antes de que lleguen los inspectores.',
    type: 'news_event',
    categories: ['vendedor_ambulante', 'feriante', 'cocinero_eventos', 'puestero_ropa'],
    requiredEvents: ['marcha'],
    baseRewardMoney: 25000,
    baseRewardRep: 8,
    basePenaltyMoney: 10000,
    basePenaltyRep: 5,
    baseDifficulty: 4,
    timeLimit: 90,
    riskType: 'arrest',
    stepTemplates: [
      'Posicioná tu puesto en el recorrido de la marcha',
      'Vendé mercadería a los manifestantes',
      'Esquivá los inspectores municipales',
    ],
    tags: ['marcha', 'venta', 'oportunidad', 'informal'],
  },
  {
    id: 'piquete_negociacion',
    titleTemplate: 'Piquete en {barrio} — Negociación',
    descriptionTemplate:
      'Hay un piquete cortando {calle}. El municipio necesita a alguien que negocie para levantar el corte. Plata hay, pero el riesgo también.',
    type: 'news_event',
    categories: ['político_barrial', 'sindicalista', 'puntero', 'periodista'],
    requiredEvents: ['marcha', 'paro'],
    baseRewardMoney: 40000,
    baseRewardRep: 25,
    basePenaltyMoney: 0,
    basePenaltyRep: 20,
    baseDifficulty: 7,
    timeLimit: 60,
    riskType: 'injury',
    stepTemplates: [
      'Contactá al líder del piquete',
      'Escuchá sus demandas y llevalas al municipio',
      'Cerrá un acuerdo que levante el corte',
    ],
    tags: ['piquete', 'politica', 'negociacion'],
  },
  {
    id: 'volantear_elecciones',
    titleTemplate: 'Campaña electoral en {barrio}',
    descriptionTemplate:
      'Un candidato a concejal paga para repartir boletas y volantes en {barrio}. Trabajo gris pero paga.',
    type: 'personal',
    categories: ['político_barrial', 'puntero'],
    requiredEvents: ['elecciones'],
    baseRewardMoney: 15000,
    baseRewardRep: -5,
    basePenaltyMoney: 0,
    basePenaltyRep: -10,
    baseDifficulty: 2,
    timeLimit: 120,
    riskType: 'none',
    stepTemplates: [
      'Recibí el material de campaña en el búnker',
      'Repartí boletas por las manzanas asignadas',
      'Reportá al coordinador cuántas casas visitaste',
    ],
    tags: ['elecciones', 'politica', 'campaña'],
  },

  // --- BUROCRACIA Y TRÁMITES ---
  {
    id: 'tramite_anses',
    titleTemplate: 'Trámite ANSES para {NPC}',
    descriptionTemplate:
      'El ANSES tiene problemas con el sistema y {NPC} no puede cobrar su jubilación. Ayudalo a hacer el trámite — el sistema cae cada 20 minutos.',
    type: 'cooperative',
    categories: [],
    baseRewardMoney: 8000,
    baseRewardRep: 15,
    basePenaltyMoney: 0,
    basePenaltyRep: 5,
    baseDifficulty: 3,
    timeLimit: 120,
    riskType: 'none',
    stepTemplates: [
      'Sacá turno online para {NPC} (el sistema va a caerse al menos una vez)',
      'Acompañá a {NPC} a la oficina del ANSES en {barrio}',
      'Completá el formulario y esperá la validación',
    ],
    tags: ['anses', 'jubilacion', 'tramite', 'solidaridad'],
  },
  {
    id: 'renovar_dni',
    titleTemplate: 'Renovación de DNI urgente',
    descriptionTemplate:
      'A {NPC} se le venció el DNI y tiene un vuelo en 3 días. El Registro Civil de {barrio} tiene cola desde las 6am.',
    type: 'personal',
    categories: [],
    baseRewardMoney: 12000,
    baseRewardRep: 10,
    basePenaltyMoney: 0,
    basePenaltyRep: 8,
    baseDifficulty: 4,
    timeLimit: 240,
    riskType: 'none',
    stepTemplates: [
      'Sacá turno en el sistema MI ARGENTINA o el Registro Civil',
      'Reuní la documentación necesaria',
      'Completá el trámite y pagá la tasa correspondiente',
    ],
    tags: ['dni', 'tramite', 'registro_civil'],
  },
  {
    id: 'habilitacion_municipal',
    titleTemplate: 'Habilitación municipal en {barrio}',
    descriptionTemplate:
      'Abriste un pequeño negocio en {barrio} pero los inspectores van a pasar. Necesitás la habilitación o te clausuran.',
    type: 'personal',
    categories: ['comerciante', 'vendedor_ambulante', 'feriante'],
    baseRewardMoney: 30000,
    baseRewardRep: 12,
    basePenaltyMoney: 50000,
    basePenaltyRep: 20,
    baseDifficulty: 6,
    timeLimit: 180,
    riskType: 'arrest',
    stepTemplates: [
      'Juntá los documentos para la habilitación',
      'Presentate en el CGP de {barrio}',
      'Pagá los aranceles y esperá la inspección',
    ],
    tags: ['habilitacion', 'comercio', 'burocracia'],
  },
  {
    id: 'plan_social_tramite',
    titleTemplate: 'Tramitar plan social en {barrio}',
    descriptionTemplate:
      'Una familia de {barrio} necesita ayuda para acceder a un programa social. El sistema online no les funciona y el plazo cierra en 48hs.',
    type: 'cooperative',
    categories: [],
    baseRewardMoney: 5000,
    baseRewardRep: 20,
    basePenaltyMoney: 0,
    basePenaltyRep: 5,
    baseDifficulty: 2,
    timeLimit: 90,
    riskType: 'none',
    stepTemplates: [
      'Ayudá a la familia a completar el formulario online',
      'Escaneá y subí los documentos requeridos',
      'Confirmá la inscripción antes del cierre',
    ],
    tags: ['plan_social', 'tramite', 'solidaridad'],
  },

  // --- SALUD ---
  {
    id: 'conseguir_medicamentos',
    titleTemplate: 'Medicamentos sin stock en {barrio}',
    descriptionTemplate:
      'El hospital de {barrio} no tiene stock de {medicamento}. {NPC} los necesita urgente. Recorrés farmacias o buscás por redes.',
    type: 'crisis',
    categories: ['médico', 'enfermero', 'farmacéutico'],
    baseRewardMoney: 10000,
    baseRewardRep: 18,
    basePenaltyMoney: 0,
    basePenaltyRep: 10,
    baseDifficulty: 4,
    timeLimit: 60,
    riskType: 'none',
    stepTemplates: [
      'Verificá en qué farmacias de {barrio} puede haber stock',
      'Conseguí los medicamentos (con receta)',
      'Entregáselos a {NPC} antes de que sea tarde',
    ],
    tags: ['salud', 'medicamentos', 'urgencia'],
  },
  {
    id: 'guardia_hospital',
    titleTemplate: 'Guardia colapsada en el Pirovano',
    descriptionTemplate:
      'La guardia del hospital está llena y no dan turnos. {NPC} necesita atención urgente. Conseguí que lo atiendan aunque sea por privado.',
    type: 'crisis',
    categories: ['médico', 'enfermero'],
    baseRewardMoney: 20000,
    baseRewardRep: 15,
    basePenaltyMoney: 0,
    basePenaltyRep: 20,
    baseDifficulty: 5,
    timeLimit: 90,
    riskType: 'none',
    stepTemplates: [
      'Evaluá la gravedad del caso de {NPC}',
      'Gestioná un turno urgente o derivación',
      'Acompañá a {NPC} hasta que sea atendido',
    ],
    tags: ['salud', 'hospital', 'urgencia'],
  },

  // --- EDUCACIÓN ---
  {
    id: 'clases_particulares',
    titleTemplate: 'Dar clases particulares en {barrio}',
    descriptionTemplate:
      'Hay demanda de clases de {materia} en {barrio}. Pagan bien, pero hay competencia. Publicitate primero.',
    type: 'competitive',
    categories: ['docente', 'estudiante'],
    baseRewardMoney: 14000,
    baseRewardRep: 8,
    basePenaltyMoney: 0,
    basePenaltyRep: 3,
    baseDifficulty: 3,
    timeLimit: 60,
    riskType: 'none',
    stepTemplates: [
      'Publicitate en los grupos de WhatsApp del barrio',
      'Conseguí al menos 3 alumnos antes que la competencia',
      'Dá las primeras clases y cobrá',
    ],
    tags: ['educacion', 'clases', 'competitivo'],
  },

  // --- TRANSPORTE ---
  {
    id: 'paro_transporte',
    titleTemplate: 'Paro de colectivos en {barrio}',
    descriptionTemplate:
      'Hay paro de transporte. Nadie puede moverse y todos necesitan llegar a algún lado. Oportunidad para el transporte alternativo.',
    type: 'news_event',
    categories: ['taxista', 'ruletero', 'delivery_independiente'],
    requiredEvents: ['paro'],
    baseRewardMoney: 35000,
    baseRewardRep: 5,
    basePenaltyMoney: 5000,
    basePenaltyRep: 0,
    baseDifficulty: 3,
    timeLimit: 180,
    riskType: 'arrest',
    stepTemplates: [
      'Publicitate como transporte alternativo',
      'Completá al menos 5 viajes en la zona',
      'Cobrá a precio del momento (triplicado por la demanda)',
    ],
    tags: ['transporte', 'paro', 'oportunidad'],
  },
  {
    id: 'verificacion_autos',
    titleTemplate: 'VTV vencida — turno en {barrio}',
    descriptionTemplate:
      'La VTV de {NPC} venció hace 3 meses. Los operativos están intensificados. Conseguile turno y acompañalo.',
    type: 'personal',
    categories: ['taxista', 'mecánico'],
    baseRewardMoney: 8000,
    baseRewardRep: 6,
    basePenaltyMoney: 20000,
    basePenaltyRep: 10,
    baseDifficulty: 2,
    timeLimit: 120,
    riskType: 'arrest',
    stepTemplates: [
      'Sacá turno online para la VTV',
      'Asegurate que el auto esté en condiciones mínimas',
      'Llevá el vehículo a la verificación y aprobala',
    ],
    tags: ['vtv', 'auto', 'transporte', 'tramite'],
  },

  // --- INFORMAL Y SUBSISTENCIA ---
  {
    id: 'cartonero_reciclaje',
    titleTemplate: 'Circuito de reciclaje en {barrio}',
    descriptionTemplate:
      'Hay un operativo de reciclaje en {barrio}. Los cartoneros organizados cobran más. Armá una ruta eficiente antes del camión municipal.',
    type: 'competitive',
    categories: ['cartonero'],
    baseRewardMoney: 9000,
    baseRewardRep: 10,
    basePenaltyMoney: 0,
    basePenaltyRep: 0,
    baseDifficulty: 3,
    timeLimit: 90,
    riskType: 'none',
    stepTemplates: [
      'Trazá una ruta de recolección por {barrio}',
      'Juntá al menos 50kg de cartón/plástico',
      'Entregá en el centro de acopio antes que el camión municipal',
    ],
    tags: ['cartonero', 'reciclaje', 'informal'],
  },
  {
    id: 'cuidacoches_evento',
    titleTemplate: 'Evento en {barrio} — Cuidacoches',
    descriptionTemplate:
      'Hay un evento en {barrio} esta noche. Cientos de autos y los dueños quieren tranquilidad. Organizá el espacio antes que lleguen.',
    type: 'competitive',
    categories: ['cuidacoches', 'trapito'],
    baseRewardMoney: 12000,
    baseRewardRep: 4,
    basePenaltyMoney: 3000,
    basePenaltyRep: 5,
    baseDifficulty: 2,
    timeLimit: 180,
    riskType: 'arrest',
    stepTemplates: [
      'Reclamá tu zona antes de que lleguen otros cuidacoches',
      'Organizá el estacionamiento en la cuadra',
      'Cobrá a los conductores al irse',
    ],
    tags: ['cuidacoches', 'informal', 'evento'],
  },
  {
    id: 'malabarista_semaforo',
    titleTemplate: 'Hora pico en {barrio} — Semáforo',
    descriptionTemplate:
      'La hora pico en {barrio} junta cientos de autos en cada semáforo. Hay plata en esa espera pero también patrulleros.',
    type: 'personal',
    categories: ['malabarista_semaforo', 'limpiavidrios'],
    baseRewardMoney: 7000,
    baseRewardRep: 3,
    basePenaltyMoney: 2000,
    basePenaltyRep: 5,
    baseDifficulty: 2,
    timeLimit: 120,
    riskType: 'arrest',
    stepTemplates: [
      'Elegí el semáforo con más tráfico de {barrio}',
      'Realizá tu show en al menos 30 ciclos del semáforo',
      'Recaudá sin que te saquen',
    ],
    tags: ['semaforo', 'informal', 'espectaculo'],
  },
  {
    id: 'feria_americana',
    titleTemplate: 'Feria americana en {barrio}',
    descriptionTemplate:
      'Se organiza una feria americana en {barrio}. Vendé ropa usada, junquete valioso, lo que tengas. El lugar es limitado.',
    type: 'competitive',
    categories: ['feriante', 'vendedor_ambulante', 'puestero_ropa', 'artesano'],
    baseRewardMoney: 20000,
    baseRewardRep: 6,
    basePenaltyMoney: 0,
    basePenaltyRep: 0,
    baseDifficulty: 2,
    timeLimit: 180,
    riskType: 'none',
    stepTemplates: [
      'Registrá tu puesto antes de que se llenen los lugares',
      'Armá la exhibición para atraer clientes',
      'Vendé el 70% de tu mercadería para considerar la misión exitosa',
    ],
    tags: ['feria', 'venta', 'informal'],
  },

  // --- ARTE Y CULTURA ---
  {
    id: 'musico_callejero_evento',
    titleTemplate: 'Festival improvisado en {barrio}',
    descriptionTemplate:
      'Se armó un festival improvisado en {barrio}. Los músicos callejeros están llegando. El que toque mejor se lleva los propinas del día.',
    type: 'competitive',
    categories: ['músico_callejero'],
    requiredEvents: ['evento_cultural'],
    baseRewardMoney: 18000,
    baseRewardRep: 12,
    basePenaltyMoney: 0,
    basePenaltyRep: 0,
    baseDifficulty: 4,
    timeLimit: 120,
    riskType: 'none',
    stepTemplates: [
      'Elegí tu spot antes que los otros músicos',
      'Tocá al menos 2 horas continuas',
      'Acumulá propinas del público',
    ],
    tags: ['musica', 'cultura', 'arte'],
  },
  {
    id: 'graffiti_mural',
    titleTemplate: 'Encargo de mural en {barrio}',
    descriptionTemplate:
      'Una organización barrial de {barrio} quiere un mural en una medianera. Pagan, pero el tiempo es acotado antes de que llegue el inspector.',
    type: 'personal',
    categories: ['artesano', 'artista_urbano'],
    baseRewardMoney: 25000,
    baseRewardRep: 15,
    basePenaltyMoney: 10000,
    basePenaltyRep: 5,
    baseDifficulty: 5,
    timeLimit: 120,
    riskType: 'arrest',
    stepTemplates: [
      'Conseguí los aerosoles y materiales',
      'Pintá el mural con el diseño acordado',
      'Terminalo antes de que llegue la inspección',
    ],
    tags: ['arte', 'mural', 'cultura'],
  },

  // --- SEGURIDAD Y POLICIALES ---
  {
    id: 'operativo_barrio',
    titleTemplate: 'Operativo policial en {barrio}',
    descriptionTemplate:
      'Hay un operativo policial en {barrio}. Los negocios informales están escondiendo mercadería. Avisá a los tuyos y cubrí tu operación.',
    type: 'crisis',
    categories: ['vendedor_ambulante', 'mechero', 'bichicómé', 'dealer_trucho'],
    requiredEvents: ['operativo_policial'],
    baseRewardMoney: 5000,
    baseRewardRep: 5,
    basePenaltyMoney: 50000,
    basePenaltyRep: 30,
    baseDifficulty: 7,
    timeLimit: 30,
    riskType: 'arrest',
    stepTemplates: [
      'Escondé la mercadería o la movés a otra zona',
      'Avisá a los contactos de la zona',
      'Esperá a que el operativo se levante',
    ],
    tags: ['operativo', 'policia', 'informal', 'riesgo'],
  },
  {
    id: 'denuncia_vecinal',
    titleTemplate: 'Denuncia en la comisaría de {barrio}',
    descriptionTemplate:
      'Te robaron o entraron a tu casa. La comisaría de {barrio} tiene cola de dos horas. El trámite es un laberinto.',
    type: 'personal',
    categories: [],
    baseRewardMoney: 5000,
    baseRewardRep: 5,
    basePenaltyMoney: 0,
    basePenaltyRep: 3,
    baseDifficulty: 2,
    timeLimit: 180,
    riskType: 'none',
    stepTemplates: [
      'Esperá tu turno en la comisaría (mínimo 90 minutos)',
      'Describí los hechos sin contradecirte',
      'Conseguí la copia de la denuncia',
    ],
    tags: ['policia', 'denuncia', 'tramite'],
  },

  // --- PERIODISMO E INFORMACIÓN ---
  {
    id: 'primicia_barrial',
    titleTemplate: 'Primicia en {barrio}',
    descriptionTemplate:
      'Pasó algo importante en {barrio} y ningún medio llegó. Si publicás primero la noticia, tu reputación como periodista sube exponencialmente.',
    type: 'competitive',
    categories: ['periodista', 'influencer'],
    baseRewardMoney: 15000,
    baseRewardRep: 25,
    basePenaltyMoney: 0,
    basePenaltyRep: 0,
    baseDifficulty: 4,
    timeLimit: 45,
    riskType: 'none',
    stepTemplates: [
      'Documentá el hecho con fotos o video',
      'Escribí la nota antes que la competencia',
      'Publicala y esperá que se viralice',
    ],
    tags: ['periodismo', 'noticia', 'competitivo'],
  },
  {
    id: 'fake_news_desmentir',
    titleTemplate: 'Fake news sobre {barrio}',
    descriptionTemplate:
      'Está circulando una fake news que afecta a {barrio} y sus negocios. Alguien tiene que desmentirla con datos reales.',
    type: 'cooperative',
    categories: ['periodista', 'abogado', 'funcionario'],
    baseRewardMoney: 20000,
    baseRewardRep: 30,
    basePenaltyMoney: 0,
    basePenaltyRep: 15,
    baseDifficulty: 5,
    timeLimit: 90,
    riskType: 'none',
    stepTemplates: [
      'Identificá el origen de la fake news',
      'Recopilá evidencia que la desmiente',
      'Publicá el desmentido y lográ difusión',
    ],
    tags: ['periodismo', 'fakennews', 'reputacion'],
  },

  // --- GASTRONOMÍA ---
  {
    id: 'catering_evento',
    titleTemplate: 'Catering para evento en {barrio}',
    descriptionTemplate:
      'Un evento privado en {barrio} necesita catering para 50 personas. Buena plata pero exigen calidad y puntualidad.',
    type: 'personal',
    categories: ['cocinero_eventos'],
    baseRewardMoney: 45000,
    baseRewardRep: 12,
    basePenaltyMoney: 15000,
    basePenaltyRep: 20,
    baseDifficulty: 6,
    timeLimit: 180,
    riskType: 'none',
    stepTemplates: [
      'Conseguí los ingredientes necesarios',
      'Cocinás con al menos 2 horas de anticipación',
      'Entregá el catering a tiempo y en condiciones',
    ],
    tags: ['cocina', 'catering', 'evento'],
  },
  {
    id: 'empanadas_partido',
    titleTemplate: 'Empanadas para el partido de {barrio}',
    descriptionTemplate:
      'Hay un partido de fútbol barrial. 200 personas y nadie organizó la comida. Es tu momento.',
    type: 'competitive',
    categories: ['cocinero_eventos', 'vendedor_ambulante', 'feriante'],
    baseRewardMoney: 22000,
    baseRewardRep: 8,
    basePenaltyMoney: 0,
    basePenaltyRep: 0,
    baseDifficulty: 3,
    timeLimit: 120,
    riskType: 'none',
    stepTemplates: [
      'Hacé el pedido de masa e ingredientes',
      'Armá y cociná las empanadas antes del partido',
      'Vendé todo antes del final del partido',
    ],
    tags: ['comida', 'futbol', 'venta'],
  },

  // --- VIVIENDA ---
  {
    id: 'inquilino_vs_propietario',
    titleTemplate: 'Conflicto con el propietario en {barrio}',
    descriptionTemplate:
      'Tu propietario pretende subir el alquiler un {porcentaje}% de un mes para el otro. Tenés derechos legales. ¿Los usás o negociás?',
    type: 'personal',
    categories: [],
    baseRewardMoney: 30000,
    baseRewardRep: 10,
    basePenaltyMoney: 0,
    basePenaltyRep: 5,
    baseDifficulty: 5,
    timeLimit: 180,
    riskType: 'debt',
    stepTemplates: [
      'Revisá el contrato de alquiler para ver los plazos de ajuste',
      'Consultá con un abogado inquilinista o centro de atención',
      'Negociá o iniciá el proceso formal de mediación',
    ],
    tags: ['alquiler', 'vivienda', 'negociacion'],
  },
  {
    id: 'toma_terreno',
    titleTemplate: 'Conflicto por terreno en {barrio}',
    descriptionTemplate:
      'Hay un conflicto por un terreno baldío en {barrio}. Vecinos quieren hacerlo plaza, el municipio quiere venderlo, especuladores quieren construir.',
    type: 'cooperative',
    categories: ['político_barrial', 'puntero', 'periodista', 'abogado'],
    baseRewardMoney: 50000,
    baseRewardRep: 30,
    basePenaltyMoney: 0,
    basePenaltyRep: 15,
    baseDifficulty: 8,
    timeLimit: 240,
    riskType: 'none',
    stepTemplates: [
      'Organizá a los vecinos afectados',
      'Buscá apoyo legal y mediático',
      'Presentá el reclamo formal ante el municipio',
    ],
    tags: ['vivienda', 'politica', 'comunidad'],
  },

  // --- ECONOMÍA INFORMAL ---
  {
    id: 'revendedor_entradas',
    titleTemplate: 'Entradas agotadas para el recital de {artista}',
    descriptionTemplate:
      'Se agotaron las entradas para el recital de {artista} en {barrio}. Los revendedores ya están en la puerta. Llegá primero.',
    type: 'competitive',
    categories: ['revendedor_entradas'],
    requiredEvents: ['evento_cultural'],
    baseRewardMoney: 30000,
    baseRewardRep: -5,
    basePenaltyMoney: 5000,
    basePenaltyRep: 0,
    baseDifficulty: 4,
    timeLimit: 60,
    riskType: 'arrest',
    stepTemplates: [
      'Comprá entradas antes del agotamiento',
      'Posicionáte en la puerta del venue',
      'Revendé con el mayor margen posible',
    ],
    tags: ['entradas', 'reventa', 'evento'],
  },
  {
    id: 'delivery_pico',
    titleTemplate: 'Horario pico de delivery en {barrio}',
    descriptionTemplate:
      'Es viernes a la noche. Los pedidos de delivery se multiplicaron por 5 y hay solo 3 repartidores activos en {barrio}. Salí ahora.',
    type: 'competitive',
    categories: ['delivery_independiente'],
    baseRewardMoney: 28000,
    baseRewardRep: 7,
    basePenaltyMoney: 0,
    basePenaltyRep: 5,
    baseDifficulty: 3,
    timeLimit: 120,
    riskType: 'none',
    stepTemplates: [
      'Activáte en la app de delivery',
      'Completá al menos 6 pedidos en la hora pico',
      'Mantené una calificación positiva',
    ],
    tags: ['delivery', 'informal', 'competitivo'],
  },

  // --- ILEGALES (mecánicas abstractas) ---
  {
    id: 'hurto_oportunidad',
    titleTemplate: 'Oportunidad en {barrio}',
    descriptionTemplate:
      'En el caos del {evento} en {barrio}, hay oportunidades para el que esté atento. La distraccción del crowd es tu ventaja.',
    type: 'personal',
    categories: ['mechero'],
    requiredEvents: ['marcha', 'evento_cultural'],
    baseRewardMoney: 20000,
    baseRewardRep: -10,
    basePenaltyMoney: 0,
    basePenaltyRep: -30,
    baseDifficulty: 6,
    timeLimit: 30,
    riskType: 'arrest',
    stepTemplates: [
      'Identificá el objetivo en la multitud',
      'Actuá en el momento de mayor distracción',
      'Salí de la zona antes de que levanten el evento',
    ],
    tags: ['ilegal', 'hurto', 'riesgo'],
  },
  {
    id: 'estafa_cuento_tio',
    titleTemplate: 'Operación en {barrio}',
    descriptionTemplate:
      'Hay una operación de cuento del tío en {barrio}. El objetivo tiene mucha plata y poca desconfianza. Actuá rápido.',
    type: 'personal',
    categories: ['cuentero_tio'],
    baseRewardMoney: 60000,
    baseRewardRep: -20,
    basePenaltyMoney: 0,
    basePenaltyRep: -40,
    baseDifficulty: 8,
    timeLimit: 45,
    riskType: 'arrest',
    stepTemplates: [
      'Contactá al objetivo con el pretexto acordado',
      'Ejecutá el plan sin levantar sospechas',
      'Cerrá la operación y desaparecé de la zona',
    ],
    tags: ['ilegal', 'estafa', 'riesgo_alto'],
  },
  {
    id: 'transporte_paquete',
    titleTemplate: 'Encomienda urgente a {barrio}',
    descriptionTemplate:
      'Necesitan transportar un paquete a {barrio} sin preguntas. No sabés qué lleva. Pagan el triple del mercado.',
    type: 'personal',
    categories: ['mula', 'ruletero'],
    baseRewardMoney: 50000,
    baseRewardRep: -5,
    basePenaltyMoney: 0,
    basePenaltyRep: -50,
    baseDifficulty: 8,
    timeLimit: 60,
    riskType: 'arrest',
    stepTemplates: [
      'Recibí el paquete en el punto de encuentro',
      'Transportalo por la ruta alternativa evitando controles',
      'Entregalo y cobrá sin dejar rastro',
    ],
    tags: ['ilegal', 'transporte', 'riesgo_alto'],
  },
  {
    id: 'venta_falsificaciones',
    titleTemplate: 'Mercadería trucha en {barrio}',
    descriptionTemplate:
      'Llegó un cargamento de ropa de marca trucha en {barrio}. Hay que moverlo rápido antes de que lleguen los inspectores.',
    type: 'competitive',
    categories: ['dealer_trucho'],
    baseRewardMoney: 35000,
    baseRewardRep: -8,
    basePenaltyMoney: 30000,
    basePenaltyRep: -20,
    baseDifficulty: 5,
    timeLimit: 90,
    riskType: 'arrest',
    stepTemplates: [
      'Montá el puesto en la zona de menor patrullaje',
      'Vendé el lote completo antes que la competencia',
      'Levantá el puesto cuando veas inspectores',
    ],
    tags: ['ilegal', 'falsificaciones', 'riesgo'],
  },
  {
    id: 'evasion_pagos',
    titleTemplate: 'Colarse en el sistema de {barrio}',
    descriptionTemplate:
      'Los molinetes del subte en {barrio} están en mantenimiento. El personal está distraído. Coordinar el acceso gratuito masivo tiene su mecánica.',
    type: 'personal',
    categories: ['colado_profesional'],
    baseRewardMoney: 8000,
    baseRewardRep: -5,
    basePenaltyMoney: 5000,
    basePenaltyRep: -10,
    baseDifficulty: 3,
    timeLimit: 30,
    riskType: 'arrest',
    stepTemplates: [
      'Identificá el punto de menor control',
      'Coordiná el acceso en el momento de distracción del personal',
      'Salí limpio sin intervenciones',
    ],
    tags: ['ilegal', 'evasion', 'transporte'],
  },
  {
    id: 'informante_barrial',
    titleTemplate: 'Información valiosa sobre {barrio}',
    descriptionTemplate:
      'Alguien está dispuesto a pagar bien por información sobre movimientos en {barrio}. El riesgo es el silencio que se rompe.',
    type: 'personal',
    categories: ['buchón'],
    baseRewardMoney: 40000,
    baseRewardRep: -25,
    basePenaltyMoney: 0,
    basePenaltyRep: -60,
    baseDifficulty: 7,
    timeLimit: 60,
    riskType: 'injury',
    stepTemplates: [
      'Recopilá la información pedida sin ser visto',
      'Establecé el canal de entrega seguro',
      'Entregá los datos y cobrá',
    ],
    tags: ['ilegal', 'informacion', 'riesgo_alto'],
  },

  // --- EVENTOS ESPECIALES ---
  {
    id: 'partido_clasico',
    titleTemplate: 'Clásico de fútbol en {barrio}',
    descriptionTemplate:
      'Hay un clásico hoy. La ciudad se paraliza. Hay negocios que explotan y otros que tienen que cerrar. Elegí tu posición.',
    type: 'news_event',
    categories: [],
    baseRewardMoney: 20000,
    baseRewardRep: 10,
    basePenaltyMoney: 5000,
    basePenaltyRep: 5,
    baseDifficulty: 3,
    timeLimit: 180,
    riskType: 'injury',
    stepTemplates: [
      'Decidí si vas al estadio o aprovechás el caos para trabajar',
      'Completá tu actividad durante el partido',
      'Manejá la situación post-partido',
    ],
    tags: ['futbol', 'evento', 'ciudad'],
  },
  {
    id: 'finde_largo',
    titleTemplate: 'Finde largo — Escapada urgente',
    descriptionTemplate:
      'Es finde largo y alguien canceló un viaje. Hay pasajes en oferta para este fin de semana pero hay que conseguir alojamiento en 2 horas.',
    type: 'personal',
    categories: [],
    baseRewardMoney: 5000,
    baseRewardRep: 8,
    basePenaltyMoney: 10000,
    basePenaltyRep: 0,
    baseDifficulty: 3,
    timeLimit: 120,
    riskType: 'none',
    stepTemplates: [
      'Conseguí los pasajes antes que se agoten',
      'Reservá alojamiento disponible en el destino',
      'Organizá todo en menos de 2 horas',
    ],
    tags: ['finde_largo', 'turismo', 'personal'],
  },
  {
    id: 'inundacion_barrio',
    titleTemplate: 'Inundación en {barrio}',
    descriptionTemplate:
      'Llovió 80mm en 2 horas y {barrio} está bajo agua. Los vecinos necesitan ayuda urgente para rescatar pertenencias y reubicar familias.',
    type: 'crisis',
    categories: [],
    baseRewardMoney: 0,
    baseRewardRep: 30,
    basePenaltyMoney: 0,
    basePenaltyRep: 5,
    baseDifficulty: 6,
    timeLimit: 90,
    riskType: 'injury',
    stepTemplates: [
      'Organizá el rescate de objetos del piso bajo',
      'Ayudá a reubicar a las familias afectadas',
      'Coordiná con los bomberos o defensa civil',
    ],
    tags: ['crisis', 'inundacion', 'comunidad'],
  },
  {
    id: 'ola_calor',
    titleTemplate: 'Ola de calor en {barrio}',
    descriptionTemplate:
      '43 grados en {barrio}. Los adultos mayores son los más vulnerables. La red comunitaria necesita distribución de agua y refrigerios.',
    type: 'cooperative',
    categories: [],
    baseRewardMoney: 5000,
    baseRewardRep: 20,
    basePenaltyMoney: 0,
    basePenaltyRep: 10,
    baseDifficulty: 3,
    timeLimit: 180,
    riskType: 'none',
    stepTemplates: [
      'Identificá los vecinos mayores de 70 años en riesgo',
      'Conseguí agua y bebidas frescas',
      'Realizá la ronda de distribución antes del mediodía',
    ],
    tags: ['crisis', 'calor', 'solidaridad'],
  },
  {
    id: 'quiniela_clandestina',
    titleTemplate: 'Quiniela en {barrio}',
    descriptionTemplate:
      'Hay un punto de quiniela no oficial en {barrio}. La recaudación de hoy es importante. Organizá la bolillada antes que llegue la policía.',
    type: 'personal',
    categories: ['prestamista', 'usurero', 'puntero'],
    baseRewardMoney: 40000,
    baseRewardRep: -10,
    basePenaltyMoney: 30000,
    basePenaltyRep: -20,
    baseDifficulty: 6,
    timeLimit: 60,
    riskType: 'arrest',
    stepTemplates: [
      'Juntá las apuestas del día',
      'Realizá el sorteo en el punto fijo',
      'Distribuí los premios y guardá el margen',
    ],
    tags: ['juego', 'ilegal', 'dinero'],
  },
  {
    id: 'cambio_blue',
    titleTemplate: 'Cueva de cambio en {barrio}',
    descriptionTemplate:
      'El dólar subió y la cueva del barrio está con mucho movimiento. Necesitan ayuda para el cambio. Plata rapida pero riesgo constante.',
    type: 'personal',
    categories: ['prestamista', 'usurero', 'colado_profesional'],
    requiredEvents: ['dolar_salto'],
    baseRewardMoney: 30000,
    baseRewardRep: -5,
    basePenaltyMoney: 40000,
    basePenaltyRep: -30,
    baseDifficulty: 7,
    timeLimit: 60,
    riskType: 'arrest',
    stepTemplates: [
      'Establecé el punto de cambio discreto',
      'Procesá al menos 10 operaciones',
      'Cerrá la operación antes del cierre de cuevas',
    ],
    tags: ['dolar', 'ilegal', 'cueva'],
  },
  {
    id: 'wifi_vecinal',
    titleTemplate: 'Red comunitaria de wifi en {barrio}',
    descriptionTemplate:
      'Los vecinos de {barrio} organizaron una red de wifi compartida. Necesitan que alguien lo configure y distribuya las claves.',
    type: 'cooperative',
    categories: ['programador', 'hacker', 'ingeniero'],
    baseRewardMoney: 15000,
    baseRewardRep: 20,
    basePenaltyMoney: 0,
    basePenaltyRep: 5,
    baseDifficulty: 4,
    timeLimit: 90,
    riskType: 'none',
    stepTemplates: [
      'Configurá el router principal y la red',
      'Distribuí las credenciales a los vecinos',
      'Resolvé los problemas de conectividad iniciales',
    ],
    tags: ['tecnologia', 'comunidad', 'cooperativo'],
  },
  {
    id: 'hackeo_institucional',
    titleTemplate: 'Sistema vulnerable en {barrio}',
    descriptionTemplate:
      'El sistema de turnos del CGP de {barrio} tiene una vulnerabilidad. Quien la explote puede favorecer a personas o bloquear a otras.',
    type: 'personal',
    categories: ['hacker'],
    baseRewardMoney: 60000,
    baseRewardRep: -30,
    basePenaltyMoney: 100000,
    basePenaltyRep: -50,
    baseDifficulty: 9,
    timeLimit: 45,
    riskType: 'arrest',
    stepTemplates: [
      'Identificá la vulnerabilidad en el sistema',
      'Ejecutá el exploit sin dejar huellas',
      'Cerrá la conexión antes de que suene la alarma',
    ],
    tags: ['hacker', 'ilegal', 'tecnologia'],
  },
  {
    id: 'espia_industrial',
    titleTemplate: 'Información corporativa en {barrio}',
    descriptionTemplate:
      'Una empresa de {barrio} tiene información valiosa para la competencia. El trabajo es limpio en papel pero muy sucio en práctica.',
    type: 'personal',
    categories: ['espía_industrial'],
    baseRewardMoney: 120000,
    baseRewardRep: -20,
    basePenaltyMoney: 0,
    basePenaltyRep: -60,
    baseDifficulty: 9,
    timeLimit: 90,
    riskType: 'arrest',
    stepTemplates: [
      'Accedé al edificio con la identidad acordada',
      'Conseguí los documentos o datos objetivo',
      'Exfiltrate antes de que revisen las credenciales',
    ],
    tags: ['espionaje', 'ilegal', 'corporativo'],
  },
  {
    id: 'asamblea_vecinal',
    titleTemplate: 'Asamblea vecinal urgente en {barrio}',
    descriptionTemplate:
      'Los vecinos de {barrio} quieren convocar una asamblea por el cierre del centro de salud. Necesitan un moderador y que alguien lleve el acta.',
    type: 'cooperative',
    categories: ['político_barrial', 'sindicalista', 'periodista', 'vecino_activo'],
    baseRewardMoney: 5000,
    baseRewardRep: 25,
    basePenaltyMoney: 0,
    basePenaltyRep: 10,
    baseDifficulty: 3,
    timeLimit: 120,
    riskType: 'none',
    stepTemplates: [
      'Organizá la convocatoria por WhatsApp y cartelería',
      'Moderá la asamblea sin que se vaya de las manos',
      'Redactá el petitorio final para presentar al municipio',
    ],
    tags: ['comunidad', 'politica', 'asamblea'],
  },
  {
    id: 'colegio_sin_maestro',
    titleTemplate: 'Suplencia urgente en {barrio}',
    descriptionTemplate:
      'Una escuela de {barrio} quedó sin maestro de un día para el otro. Necesitan cubrir la suplencia ya mismo, aunque sea informal.',
    type: 'personal',
    categories: ['docente'],
    baseRewardMoney: 16000,
    baseRewardRep: 15,
    basePenaltyMoney: 0,
    basePenaltyRep: 10,
    baseDifficulty: 4,
    timeLimit: 60,
    riskType: 'none',
    stepTemplates: [
      'Confirmá la disponibilidad horaria y llevá el título',
      'Dá la clase con los recursos disponibles',
      'Completá el libro de temas y el registro',
    ],
    tags: ['educacion', 'escuela', 'docente'],
  },
  {
    id: 'peluquero_a_domicilio',
    titleTemplate: 'Ronda de cortes en {barrio}',
    descriptionTemplate:
      'Varios vecinos de {barrio} necesitan corte de pelo a domicilio. Si hacés 5 en una tarde, la plata es buena.',
    type: 'personal',
    categories: ['peluquero_domicilio'],
    baseRewardMoney: 18000,
    baseRewardRep: 8,
    basePenaltyMoney: 0,
    basePenaltyRep: 5,
    baseDifficulty: 2,
    timeLimit: 180,
    riskType: 'none',
    stepTemplates: [
      'Coordiná los turnos por WhatsApp',
      'Realizá al menos 5 cortes en el barrio',
      'Cobrá y pedí recomendaciones para más clientes',
    ],
    tags: ['peluqueria', 'domicilio', 'informal'],
  },
  {
    id: 'cuidado_adulto_mayor',
    titleTemplate: 'Cuidado de adulto mayor en {barrio}',
    descriptionTemplate:
      'Una familia de {barrio} necesita un cuidador para un adulto mayor mientras están de viaje. Pagan bien pero es compromiso total.',
    type: 'personal',
    categories: ['cuidador_adulto_mayor', 'niñero', 'enfermero'],
    baseRewardMoney: 30000,
    baseRewardRep: 15,
    basePenaltyMoney: 0,
    basePenaltyRep: 25,
    baseDifficulty: 4,
    timeLimit: 480,
    riskType: 'none',
    stepTemplates: [
      'Conocé las necesidades específicas del adulto mayor',
      'Mantené la rutina de medicación y alimentación',
      'Reportá cualquier novedad a la familia',
    ],
    tags: ['cuidado', 'adulto_mayor', 'salud'],
  },
];

// ============================================
// VARIABLES DINÁMICAS
// ============================================

const TIPOS_TRABAJO = [
  'pintura', 'albañilería', 'jardinería', 'limpieza', 'carga y descarga',
  'mantenimiento', 'electricidad básica', 'plomería básica', 'demolición',
  'carpintería', 'yesería',
];

const TIPOS_REPARACION = [
  'la caldera', 'el ascensor', 'la bomba de agua', 'el tablero eléctrico',
  'la cañería principal', 'el portón automático', 'la bomba de presión',
];

const MATERIAS = [
  'matemáticas', 'inglés', 'física', 'química', 'historia',
  'geografía', 'biología', 'informática', 'contabilidad',
];

const MEDICAMENTOS = [
  'insulina', 'medicación antihipertensiva', 'anticoagulantes',
  'broncodilatadores', 'antibióticos específicos',
];

const ARTISTAS = [
  'Lali', 'Bizarrap', 'WOS', 'Nicki Nicole', 'La Beriso',
  'Callejero Fino', 'Duki', 'Tini', 'Miranda!', 'Divididos',
];

const CALLES_PORTEÑAS = [
  'Corrientes', 'Rivadavia', 'Callao', 'Santa Fe', '9 de Julio',
  'Av. de Mayo', 'Belgrano', 'Entre Ríos', 'Avellaneda', 'Juan B. Justo',
];

const NPC_NAMES = [
  'Don Roberto', 'la señora Mirta', 'el Gordo Pereyra', 'Doña Carmen',
  'el pibe Rodrigo', 'la señorita Patricia', 'el ingeniero Zárate',
  'Néstor del kiosco', 'la abuela de la esquina', 'el señor Huang',
];

// ============================================
// UTILIDADES DE RANDOMIZACIÓN
// ============================================

function rnd<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rndInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedRandom<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return items[i];
  }
  return items[items.length - 1];
}

function injectVariables(text: string, context: MissionContext): string {
  const hood = NEIGHBORHOODS[context.neighborhoodId];
  const hoodName = hood?.name ?? context.neighborhoodId;
  const inflationPct = Math.round((context.inflationIndex - 100) * 0.8 + rndInt(5, 25));

  return text
    .replace(/{barrio}/g, hoodName)
    .replace(/{NPC}/g, rnd(NPC_NAMES))
    .replace(/{tipo_trabajo}/g, rnd(TIPOS_TRABAJO))
    .replace(/{tipo_reparacion}/g, rnd(TIPOS_REPARACION))
    .replace(/{materia}/g, rnd(MATERIAS))
    .replace(/{medicamento}/g, rnd(MEDICAMENTOS))
    .replace(/{artista}/g, rnd(ARTISTAS))
    .replace(/{calle}/g, rnd(CALLES_PORTEÑAS))
    .replace(/{evento}/g, rnd(['marcha', 'recital', 'partido', 'festival']))
    .replace(/{porcentaje}/g, String(inflationPct))
    .replace(/{monto}/g, String(rndInt(5000, 30000)))
    .replace(/{fecha}/g, 'fin de mes');
}

// ============================================
// LÓGICA DE FILTRADO Y SCORING DE TEMPLATES
// ============================================

function scoreTemplate(
  tpl: MissionTemplate,
  context: MissionContext
): number {
  let score = 50;

  // Boost por rol compatible
  if (
    tpl.categories.length === 0 ||
    tpl.categories.includes(context.userRole)
  ) {
    score += 20;
  } else {
    score -= 30; // no tan compatible
  }

  // Boost por eventos activos
  if (tpl.requiredEvents) {
    const overlap = tpl.requiredEvents.filter((e) =>
      context.activeEvents.includes(e)
    );
    score += overlap.length * 25;
    if (overlap.length === 0) return -1; // requerido pero no está activo
  }

  // Penalizar si evento prohibido está activo
  if (tpl.forbiddenEvents) {
    const conflict = tpl.forbiddenEvents.filter((e) =>
      context.activeEvents.includes(e)
    );
    if (conflict.length > 0) return -1;
  }

  // Boost por dificultad apropiada al nivel
  const idealDifficulty = Math.min(10, Math.ceil(context.userLevel / 10));
  const diffDelta = Math.abs(tpl.baseDifficulty - idealDifficulty);
  score -= diffDelta * 5;

  // Boost crisis por inflación alta
  if (tpl.type === 'crisis' && context.inflationIndex > 130) score += 15;

  // Boost económico cuando el dólar subió
  if (
    tpl.tags.includes('dolar') &&
    context.dollarRate > 1400
  ) score += 20;

  // Penalizar ilegales para usuarios de bajo nivel
  if (tpl.tags.includes('ilegal') && context.userLevel < 15) score -= 40;

  // Boost de noche para ciertos templates
  if (context.timeOfDay === 'night' && tpl.tags.includes('evento')) score += 10;

  return score;
}

function selectTemplate(context: MissionContext): MissionTemplate {
  const scored = MISSION_TEMPLATES.map((tpl) => ({
    tpl,
    score: scoreTemplate(tpl, context),
  })).filter((x) => x.score > 0);

  if (scored.length === 0) {
    // fallback: cualquier template sin eventos requeridos
    const fallbacks = MISSION_TEMPLATES.filter((t) => !t.requiredEvents);
    return rnd(fallbacks);
  }

  // Selección ponderada
  const weights = scored.map((x) => Math.max(1, x.score));
  const chosen = weightedRandom(scored, weights);
  return chosen.tpl;
}

// ============================================
// CÁLCULO DE RECOMPENSAS CON CONTEXTO
// ============================================

function calculateReward(
  tpl: MissionTemplate,
  context: MissionContext,
  difficulty: number
): MissionReward {
  const inflationMult = context.inflationIndex / 100;
  const diffMult = 0.7 + difficulty * 0.1;
  const money = Math.round(
    tpl.baseRewardMoney * inflationMult * diffMult * (0.9 + Math.random() * 0.2)
  );

  const skillBonus: Partial<UserSkills> = {};
  if (tpl.tags.includes('tecnico')) skillBonus.technical = rndInt(1, 3);
  if (tpl.tags.includes('negociacion') || tpl.tags.includes('social')) skillBonus.social = rndInt(1, 3);
  if (tpl.tags.includes('fisico')) skillBonus.physical = rndInt(1, 3);
  if (tpl.tags.includes('calle') || tpl.tags.includes('informal')) skillBonus.street = rndInt(1, 3);

  return {
    money,
    reputation: Math.round(tpl.baseRewardRep * diffMult),
    skillPoints: skillBonus,
  };
}

function calculatePenalty(
  tpl: MissionTemplate,
  context: MissionContext
): MissionPenalty {
  const inflationMult = context.inflationIndex / 100;
  return {
    money: Math.round(tpl.basePenaltyMoney * inflationMult),
    reputation: tpl.basePenaltyRep,
    riskType: tpl.riskType,
  };
}

function buildSteps(tpl: MissionTemplate, context: MissionContext): MissionStep[] {
  return tpl.stepTemplates.map((stepText, idx) => ({
    id: uuidv4(),
    description: injectVariables(stepText, context),
    action: `step_${idx + 1}`,
    completed: false,
  }));
}

// ============================================
// FUNCIÓN PRINCIPAL: generateMission
// ============================================

export function generateMission(
  userId: string,
  context: MissionContext
): Mission {
  const tpl = selectTemplate(context);
  const hood = NEIGHBORHOODS[context.neighborhoodId];
  const hoodCenter = hood?.center ?? { lat: -34.6037, lng: -58.3816 };

  // Dificultad adaptativa al nivel del usuario
  const baseDiff = tpl.baseDifficulty;
  const levelAdj = Math.max(0, (context.userLevel - 10) * 0.05);
  const difficulty = Math.min(10, Math.max(1, Math.round(baseDiff + levelAdj + rndInt(-1, 1))));

  const reward = calculateReward(tpl, context, difficulty);
  const penalty = calculatePenalty(tpl, context);
  const steps = buildSteps(tpl, context);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + tpl.timeLimit * 60 * 1000);

  // Añadir variación de tiempo según tipo
  const timeLimitActual = tpl.timeLimit + rndInt(-10, 10);

  const mission: Mission = {
    id: uuidv4(),
    title: injectVariables(tpl.titleTemplate, context),
    description: injectVariables(tpl.descriptionTemplate, context),
    type: tpl.type,
    targetUsers: [userId],
    location: {
      lat: hoodCenter.lat + (Math.random() - 0.5) * 0.01,
      lng: hoodCenter.lng + (Math.random() - 0.5) * 0.01,
    },
    neighborhoodId: context.neighborhoodId,
    reward,
    penalty,
    timeLimit: Math.max(15, timeLimitActual),
    difficulty,
    steps,
    status: 'pending',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  return mission;
}

// ============================================
// FUNCIÓN: generateMultiUserMission
// ============================================

export function generateMultiUserMission(
  userIds: string[],
  context: MissionContext
): Mission {
  // Para misiones multi-usuario, priorizar cooperativas o competitivas
  const multiContext: MissionContext = { ...context, activeEvents: context.activeEvents };

  // Forzar selección hacia tipos cooperativos/competitivos
  const multiTemplates = MISSION_TEMPLATES.filter((t) =>
    t.type === 'cooperative' || t.type === 'competitive'
  );

  const scored = multiTemplates
    .map((tpl) => ({ tpl, score: scoreTemplate(tpl, multiContext) }))
    .filter((x) => x.score > 0);

  let tpl: MissionTemplate;
  if (scored.length > 0) {
    const weights = scored.map((x) => Math.max(1, x.score));
    tpl = weightedRandom(scored, weights).tpl;
  } else {
    tpl = rnd(multiTemplates);
  }

  const hood = NEIGHBORHOODS[context.neighborhoodId];
  const hoodCenter = hood?.center ?? { lat: -34.6037, lng: -58.3816 };

  // Dificultad escala con cantidad de usuarios
  const groupMult = Math.min(2, 1 + userIds.length * 0.15);
  const difficulty = Math.min(
    10,
    Math.round(tpl.baseDifficulty * groupMult)
  );

  const reward = calculateReward(tpl, context, difficulty);
  // Recompensa aumentada para grupos
  reward.money = Math.round(reward.money * (1 + userIds.length * 0.3));
  reward.reputation = Math.round(reward.reputation * 1.5);

  const penalty = calculatePenalty(tpl, context);
  const steps = buildSteps(tpl, context);

  // Pasos adicionales de coordinación para misiones grupales
  steps.unshift({
    id: uuidv4(),
    description: `Coordinar con los ${userIds.length} jugadores involucrados antes de empezar`,
    action: 'coordinate_group',
    completed: false,
  });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + tpl.timeLimit * 60 * 1000 * 1.5);

  return {
    id: uuidv4(),
    title: `[GRUPAL] ${injectVariables(tpl.titleTemplate, context)}`,
    description: injectVariables(tpl.descriptionTemplate, context),
    type: tpl.type,
    targetUsers: userIds,
    location: {
      lat: hoodCenter.lat + (Math.random() - 0.5) * 0.01,
      lng: hoodCenter.lng + (Math.random() - 0.5) * 0.01,
    },
    neighborhoodId: context.neighborhoodId,
    reward,
    penalty,
    timeLimit: Math.round(tpl.timeLimit * 1.5),
    difficulty,
    steps,
    status: 'pending',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export { MISSION_TEMPLATES };
