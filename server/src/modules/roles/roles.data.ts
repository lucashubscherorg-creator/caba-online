import type { Role } from '../../../../shared/types';

export const ROLES_DATA: Role[] = [
  // =============================================
  // FORMALES
  // =============================================
  {
    id: 'empleado_comercio', name: 'Empleado de Comercio', description: 'Trabajás en un local del barrio. Sueldo fijo, obra social, y el sindicato te cubre.',
    category: 'formal', baseIncome: 8000, incomeVariance: 0.1,
    requiredSkills: { social: 1 }, unlockLevel: 1, riskLevel: 1, legalStatus: 'legal',
    availableZones: ['palermo','recoleta','belgrano','microcentro','once','caballito','flores','almagro'],
    mechanics: [
      { id: 'turno_trabajo', name: 'Turno de trabajo', description: 'Trabajás tu turno y cobrás el jornal diario.', cooldownMinutes: 480, successRate: 0.95, rewardRange: [4000, 8000], riskOnFail: 'Descuento por tardanza' },
      { id: 'horas_extra', name: 'Horas extra', description: 'Ofrecerte para quedarte más tarde con pago extra.', cooldownMinutes: 1440, successRate: 0.8, rewardRange: [2000, 5000], riskOnFail: 'Cansancio, sin penalidad económica' },
    ],
  },
  {
    id: 'contador', name: 'Contador Público', description: 'Llevás los libros de empresas y particulares. En Argentina siempre hay trabajo para el que entiende de impuestos.',
    category: 'formal', baseIncome: 25000, incomeVariance: 0.2,
    requiredSkills: { intelligence: 4, technical: 3 }, unlockLevel: 15, riskLevel: 1, legalStatus: 'legal',
    availableZones: ['microcentro','recoleta','palermo','belgrano','caballito'],
    mechanics: [
      { id: 'declaracion_afip', name: 'Declaración AFIP', description: 'Procesás declaraciones juradas para clientes.', cooldownMinutes: 240, successRate: 0.9, rewardRange: [15000, 40000], riskOnFail: 'Error en declaración, multa para el cliente' },
      { id: 'auditoria', name: 'Auditoría de empresa', description: 'Auditás los libros contables de una PyME.', cooldownMinutes: 720, successRate: 0.85, rewardRange: [30000, 80000], riskOnFail: 'Responsabilidad solidaria' },
    ],
  },
  {
    id: 'medico', name: 'Médico', description: 'Atendés pacientes en clínica, hospital público o consultorio privado. Vocación, plata y responsabilidad.',
    category: 'service', baseIncome: 35000, incomeVariance: 0.15,
    requiredSkills: { intelligence: 6, social: 4 }, unlockLevel: 25, riskLevel: 2, legalStatus: 'legal',
    availableZones: ['recoleta','palermo','belgrano','microcentro','nunez','caballito'],
    mechanics: [
      { id: 'consulta_medica', name: 'Consulta médica', description: 'Atendés pacientes en tu horario de consultorio.', cooldownMinutes: 60, successRate: 0.95, rewardRange: [8000, 25000], riskOnFail: 'Mala praxis (reputación)' },
      { id: 'guardia', name: 'Guardia hospitalaria', description: '24 horas de guardia en el hospital. Agotador pero bien remunerado.', cooldownMinutes: 1440, successRate: 0.85, rewardRange: [50000, 100000], riskOnFail: 'Error médico bajo presión' },
    ],
  },
  {
    id: 'abogado', name: 'Abogado', description: 'Llevás casos civiles, laborales o penales. En un país con 180.000 abogados, hay que diferenciarse.',
    category: 'formal', baseIncome: 30000, incomeVariance: 0.25,
    requiredSkills: { intelligence: 5, social: 5 }, unlockLevel: 20, riskLevel: 2, legalStatus: 'legal',
    availableZones: ['microcentro','recoleta','palermo','tribunales'],
    mechanics: [
      { id: 'juicio_laboral', name: 'Juicio laboral', description: 'Representás a un trabajador en un despido injustificado.', cooldownMinutes: 480, successRate: 0.75, rewardRange: [40000, 150000], riskOnFail: 'Juicio perdido, sin honorarios' },
      { id: 'consulta_legal', name: 'Consulta legal', description: 'Asesorás a un cliente en una consulta inicial.', cooldownMinutes: 120, successRate: 0.98, rewardRange: [5000, 15000], riskOnFail: 'Consejo erróneo' },
    ],
  },
  {
    id: 'docente', name: 'Docente', description: 'Enseñás en escuela pública o privada. El sueldo es bajo pero la vocación y el aguinaldo compensan.',
    category: 'formal', baseIncome: 9000, incomeVariance: 0.05,
    requiredSkills: { social: 3, intelligence: 3 }, unlockLevel: 5, riskLevel: 1, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'clase_escolar', name: 'Dar clase', description: 'Dictás tus horas cátedra normales.', cooldownMinutes: 240, successRate: 0.99, rewardRange: [3000, 9000], riskOnFail: 'Sin penalidad' },
      { id: 'clase_particular', name: 'Clase particular', description: 'Dás clases extra a alumnos en tu tiempo libre.', cooldownMinutes: 60, successRate: 0.95, rewardRange: [3000, 8000], riskOnFail: 'Sin penalidad' },
    ],
  },
  {
    id: 'enfermero', name: 'Enfermero', description: 'El pilar del sistema de salud. Guardias, turnos y mucha resiliencia.',
    category: 'service', baseIncome: 12000, incomeVariance: 0.1,
    requiredSkills: { physical: 2, social: 3, intelligence: 2 }, unlockLevel: 8, riskLevel: 2, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'turno_guardia', name: 'Turno de guardia', description: 'Trabajás tu turno de 12 horas en el hospital.', cooldownMinutes: 720, successRate: 0.97, rewardRange: [8000, 18000], riskOnFail: 'Agotamiento' },
    ],
  },
  {
    id: 'ingeniero', name: 'Ingeniero', description: 'Diseñás proyectos de construcción, viales o industriales. Alta demanda, buen sueldo.',
    category: 'formal', baseIncome: 40000, incomeVariance: 0.2,
    requiredSkills: { intelligence: 6, technical: 6 }, unlockLevel: 25, riskLevel: 1, legalStatus: 'legal',
    availableZones: ['microcentro','puerto_madero','palermo','belgrano'],
    mechanics: [
      { id: 'proyecto_obra', name: 'Dirección de obra', description: 'Supervisás una obra de construcción.', cooldownMinutes: 480, successRate: 0.9, rewardRange: [60000, 200000], riskOnFail: 'Responsabilidad por fallas estructurales' },
      { id: 'consultoria_tecnica', name: 'Consultoría técnica', description: 'Asesoramiento técnico para un cliente puntual.', cooldownMinutes: 120, successRate: 0.95, rewardRange: [20000, 60000], riskOnFail: 'Mala recomendación' },
    ],
  },
  {
    id: 'programador', name: 'Programador', description: 'Desarrollás software en pesos o en dólares si conseguís clientes del exterior. El sueño argento.',
    category: 'formal', baseIncome: 60000, incomeVariance: 0.3,
    requiredSkills: { intelligence: 5, technical: 7 }, unlockLevel: 20, riskLevel: 1, legalStatus: 'legal',
    availableZones: ['palermo','recoleta','belgrano','microcentro'],
    mechanics: [
      { id: 'desarrollo_local', name: 'Proyecto local', description: 'Desarrollás un sistema para cliente argentino.', cooldownMinutes: 480, successRate: 0.9, rewardRange: [30000, 80000], riskOnFail: 'Bug crítico, descuento' },
      { id: 'freelance_exterior', name: 'Freelance exterior', description: 'Conseguís un proyecto en dólares del exterior.', cooldownMinutes: 720, successRate: 0.6, rewardRange: [100000, 400000], riskOnFail: 'Cliente difícil, sin pago' },
    ],
  },
  {
    id: 'policia', name: 'Policía', description: 'Agente de la Policía de la Ciudad. Complejo sistema jerárquico, sueldo escaso y mucho de qué aguantarse.',
    category: 'service', baseIncome: 11000, incomeVariance: 0.2,
    requiredSkills: { physical: 4, street: 3 }, unlockLevel: 10, riskLevel: 5, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'patrullaje', name: 'Patrullaje de zona', description: 'Patrullás el sector asignado.', cooldownMinutes: 240, successRate: 0.9, rewardRange: [4000, 8000], riskOnFail: 'Incidente en el barrio' },
      { id: 'operativo', name: 'Operativo especial', description: 'Participás en un operativo policial.', cooldownMinutes: 480, successRate: 0.8, rewardRange: [10000, 20000], riskOnFail: 'Lesión en servicio' },
      { id: 'coima_policia', name: 'Arreglo informal', description: 'Cerrás los ojos a cambio de un pago. Riesgo de sumario.', cooldownMinutes: 60, successRate: 0.7, rewardRange: [5000, 20000], riskOnFail: 'Sumario interno, suspensión' },
    ],
  },
  {
    id: 'bombero', name: 'Bombero', description: 'Voluntario o profesional. Héroe del barrio cuando hay incendio.',
    category: 'service', baseIncome: 8000, incomeVariance: 0.05,
    requiredSkills: { physical: 5, social: 2 }, unlockLevel: 8, riskLevel: 6, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'guardia_cuartel', name: 'Guardia en cuartel', description: 'Guardias de 24 horas esperando emergencias.', cooldownMinutes: 1440, successRate: 1, rewardRange: [4000, 8000], riskOnFail: 'Sin penalidad' },
      { id: 'emergencia', name: 'Responder emergencia', description: 'Respondés a un llamado real. Alto riesgo, alta recompensa reputacional.', cooldownMinutes: 240, successRate: 0.85, rewardRange: [5000, 15000], riskOnFail: 'Lesión en acto de servicio' },
    ],
  },
  {
    id: 'taxista', name: 'Taxista', description: 'Manejás tu taxi por Buenos Aires. Competencia con apps, inseguridad y el tráfico del microcentro.',
    category: 'formal', baseIncome: 15000, incomeVariance: 0.3,
    requiredSkills: { street: 3, social: 2 }, unlockLevel: 5, riskLevel: 3, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'viaje_taxi', name: 'Turno en el taxi', description: 'Salís a trabajar 8 horas en el taxi.', cooldownMinutes: 480, successRate: 0.92, rewardRange: [10000, 25000], riskOnFail: 'Asalto al taxista' },
      { id: 'aeropuerto_run', name: 'Run al aeropuerto', description: 'Viaje largo y bien pagado al Aeroparque.', cooldownMinutes: 120, successRate: 0.98, rewardRange: [8000, 18000], riskOnFail: 'Sin penalidad' },
    ],
  },
  {
    id: 'colectivero', name: 'Colectivero', description: 'Manejás la línea por Buenos Aires. Sindicato fuerte, sueldo decente y mucho tráfico.',
    category: 'formal', baseIncome: 16000, incomeVariance: 0.05,
    requiredSkills: { physical: 3, street: 2 }, unlockLevel: 5, riskLevel: 2, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'turno_colectivo', name: 'Turno de colectivo', description: 'Hacés tu recorrido completo de 8 horas.', cooldownMinutes: 480, successRate: 0.97, rewardRange: [12000, 18000], riskOnFail: 'Accidente vial menor' },
    ],
  },
  {
    id: 'gasista', name: 'Gasista Matriculado', description: 'Trabajás con instalaciones de gas. Habilitación obligatoria, buen sueldo.',
    category: 'formal', baseIncome: 20000, incomeVariance: 0.2,
    requiredSkills: { technical: 4, physical: 2 }, unlockLevel: 10, riskLevel: 3, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'instalacion_gas', name: 'Instalación de gas', description: 'Instalás artefactos de gas en un domicilio.', cooldownMinutes: 240, successRate: 0.92, rewardRange: [15000, 35000], riskOnFail: 'Fuga de gas, responsabilidad' },
    ],
  },
  {
    id: 'electricista', name: 'Electricista', description: 'Corregís instalaciones eléctricas en hogares y comercios.',
    category: 'formal', baseIncome: 18000, incomeVariance: 0.25,
    requiredSkills: { technical: 4 }, unlockLevel: 8, riskLevel: 3, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'tablero_electrico', name: 'Revisión de tablero', description: 'Revisás y corregís un tablero eléctrico.', cooldownMinutes: 120, successRate: 0.93, rewardRange: [8000, 22000], riskOnFail: 'Cortocircuito, responsabilidad' },
      { id: 'instalacion_electrica', name: 'Instalación completa', description: 'Remodelás la instalación de un local.', cooldownMinutes: 480, successRate: 0.88, rewardRange: [25000, 60000], riskOnFail: 'Multa ENRE' },
    ],
  },
  {
    id: 'plomero', name: 'Plomero', description: 'Reparás cañerías y sanitarios en toda la ciudad.',
    category: 'formal', baseIncome: 17000, incomeVariance: 0.3,
    requiredSkills: { technical: 3, physical: 3 }, unlockLevel: 6, riskLevel: 2, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'reparacion_cañeria', name: 'Reparación urgente', description: 'Atendés un llamado urgente por pérdida de agua.', cooldownMinutes: 90, successRate: 0.92, rewardRange: [8000, 25000], riskOnFail: 'Daño mayor por error' },
    ],
  },
  {
    id: 'albanil', name: 'Albañil', description: 'La columna vertebral de la construcción argentina.',
    category: 'formal', baseIncome: 14000, incomeVariance: 0.2,
    requiredSkills: { physical: 5 }, unlockLevel: 3, riskLevel: 3, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'obra_en_curso', name: 'Jornada de obra', description: 'Trabajás en una obra de construcción o refacción.', cooldownMinutes: 480, successRate: 0.95, rewardRange: [10000, 18000], riskOnFail: 'Accidente en obra' },
    ],
  },
  {
    id: 'mecanico', name: 'Mecánico', description: 'Reparás vehículos en un taller o a domicilio.',
    category: 'formal', baseIncome: 19000, incomeVariance: 0.25,
    requiredSkills: { technical: 5, physical: 3 }, unlockLevel: 8, riskLevel: 2, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'reparacion_auto', name: 'Reparación de auto', description: 'Diagnosticás y reparás un vehículo.', cooldownMinutes: 180, successRate: 0.9, rewardRange: [12000, 40000], riskOnFail: 'Daño adicional al vehículo' },
    ],
  },
  {
    id: 'veterinario', name: 'Veterinario', description: 'Buenos Aires es una ciudad pet-friendly. Mucha demanda.',
    category: 'formal', baseIncome: 22000, incomeVariance: 0.2,
    requiredSkills: { intelligence: 4, social: 3 }, unlockLevel: 15, riskLevel: 1, legalStatus: 'legal',
    availableZones: ['palermo','recoleta','belgrano','caballito','villa_urquiza'],
    mechanics: [
      { id: 'consulta_veterinaria', name: 'Consulta veterinaria', description: 'Atendés pacientes en tu clínica.', cooldownMinutes: 60, successRate: 0.97, rewardRange: [5000, 18000], riskOnFail: 'Sin penalidad' },
    ],
  },
  {
    id: 'farmaceutico', name: 'Farmacéutico', description: 'Dispensás medicamentos y asesorás en salud.',
    category: 'formal', baseIncome: 20000, incomeVariance: 0.1,
    requiredSkills: { intelligence: 4 }, unlockLevel: 15, riskLevel: 1, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'atencion_farmacia', name: 'Atención en farmacia', description: 'Trabajás tu turno en la farmacia.', cooldownMinutes: 480, successRate: 0.99, rewardRange: [12000, 22000], riskOnFail: 'Sin penalidad' },
    ],
  },

  // =============================================
  // INFORMALES
  // =============================================
  {
    id: 'vendedor_ambulante', name: 'Vendedor Ambulante', description: 'Vendés medialunas, facturas, agua, lo que sea en la calle o el subte.',
    category: 'informal', baseIncome: 7000, incomeVariance: 0.4,
    requiredSkills: { social: 2, street: 2 }, unlockLevel: 1, riskLevel: 3, legalStatus: 'gray',
    availableZones: ['*'],
    mechanics: [
      { id: 'venta_calle', name: 'Venta callejera', description: 'Salís a vender tu mercadería por el barrio.', cooldownMinutes: 240, successRate: 0.8, rewardRange: [3000, 12000], riskOnFail: 'Decomiso por inspector' },
      { id: 'venta_subte', name: 'Venta en el subte', description: 'Vendés dentro del subte, más arriesgado pero más tráfico.', cooldownMinutes: 120, successRate: 0.65, rewardRange: [4000, 15000], riskOnFail: 'Multa del Metrobus' },
    ],
  },
  {
    id: 'changarin', name: 'Changarín', description: 'Hacés changas de lo que sea: mudanzas, limpieza, carga y descarga.',
    category: 'informal', baseIncome: 6000, incomeVariance: 0.5,
    requiredSkills: { physical: 4 }, unlockLevel: 1, riskLevel: 2, legalStatus: 'gray',
    availableZones: ['*'],
    mechanics: [
      { id: 'changa_fisica', name: 'Hacer una changa', description: 'Aceptás trabajo de lo que salga.', cooldownMinutes: 120, successRate: 0.88, rewardRange: [4000, 14000], riskOnFail: 'Lesión física' },
    ],
  },
  {
    id: 'cartonero', name: 'Cartonero', description: 'Recolectás materiales reciclables para vender. Economía circular porteña.',
    category: 'informal', baseIncome: 5000, incomeVariance: 0.35,
    requiredSkills: { physical: 3, street: 3 }, unlockLevel: 1, riskLevel: 2, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'ronda_reciclaje', name: 'Ronda de reciclaje', description: 'Recorrés el barrio juntando cartón, vidrio y plástico.', cooldownMinutes: 300, successRate: 0.95, rewardRange: [3000, 9000], riskOnFail: 'Sin penalidad' },
    ],
  },
  {
    id: 'cuidacoches', name: 'Cuidacoches', description: 'Cuidás autos estacionados en la puerta de negocios y eventos.',
    category: 'informal', baseIncome: 6500, incomeVariance: 0.45,
    requiredSkills: { street: 2 }, unlockLevel: 1, riskLevel: 3, legalStatus: 'gray',
    availableZones: ['*'],
    mechanics: [
      { id: 'zona_cuidacoches', name: 'Trabajar la zona', description: 'Cuidás la cuadra durante un turno.', cooldownMinutes: 300, successRate: 0.78, rewardRange: [3000, 12000], riskOnFail: 'Conflicto con policía o rival' },
    ],
  },
  {
    id: 'feriante', name: 'Feriante', description: 'Tenés un puesto en ferias de artesanías, ropa o comida.',
    category: 'informal', baseIncome: 9000, incomeVariance: 0.4,
    requiredSkills: { social: 3 }, unlockLevel: 3, riskLevel: 2, legalStatus: 'gray',
    availableZones: ['san_telmo','palermo','recoleta','la_boca'],
    mechanics: [
      { id: 'dia_feria', name: 'Día de feria', description: 'Trabajás tu puesto durante la jornada de feria.', cooldownMinutes: 480, successRate: 0.85, rewardRange: [5000, 20000], riskOnFail: 'Inspector municipal' },
    ],
  },
  {
    id: 'delivery_independiente', name: 'Delivery Independiente', description: 'Hacés entregas en bici o moto para apps o negocios directos.',
    category: 'informal', baseIncome: 11000, incomeVariance: 0.35,
    requiredSkills: { physical: 3, street: 4 }, unlockLevel: 3, riskLevel: 3, legalStatus: 'gray',
    availableZones: ['*'],
    mechanics: [
      { id: 'turno_delivery', name: 'Turno de delivery', description: 'Hacés entregas durante la hora pico.', cooldownMinutes: 240, successRate: 0.87, rewardRange: [8000, 22000], riskOnFail: 'Accidente vial' },
    ],
  },
  {
    id: 'malabarista_semaforo', name: 'Malabarista de Semáforo', description: 'Hacés shows en los semáforos para juntar propinas.',
    category: 'informal', baseIncome: 5500, incomeVariance: 0.5,
    requiredSkills: { physical: 3, social: 2 }, unlockLevel: 1, riskLevel: 2, legalStatus: 'gray',
    availableZones: ['*'],
    mechanics: [
      { id: 'show_semaforo', name: 'Show en semáforo', description: 'Realizás tu actuación en la hora pico.', cooldownMinutes: 120, successRate: 0.82, rewardRange: [2000, 9000], riskOnFail: 'Brigada de inspectores' },
    ],
  },
  {
    id: 'musico_callejero', name: 'Músico Callejero', description: 'Tocás en el subte, en la calle o en plazas. Buenos Aires tiene tradición musical.',
    category: 'informal', baseIncome: 8000, incomeVariance: 0.45,
    requiredSkills: { social: 4, intelligence: 2 }, unlockLevel: 2, riskLevel: 1, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'toque_callejero', name: 'Toque callejero', description: 'Tocás tu repertorio y colectás propinas.', cooldownMinutes: 180, successRate: 0.88, rewardRange: [3000, 15000], riskOnFail: 'Sin penalidad' },
    ],
  },
  {
    id: 'artesano', name: 'Artesano', description: 'Fabricás y vendés objetos artesanales: cuero, bijouterie, madera.',
    category: 'informal', baseIncome: 10000, incomeVariance: 0.35,
    requiredSkills: { technical: 3, social: 2 }, unlockLevel: 3, riskLevel: 1, legalStatus: 'legal',
    availableZones: ['san_telmo','palermo','recoleta','la_boca'],
    mechanics: [
      { id: 'venta_artesanias', name: 'Venta de artesanías', description: 'Vendés tu producción en la feria o a domicilio.', cooldownMinutes: 240, successRate: 0.88, rewardRange: [4000, 18000], riskOnFail: 'Sin penalidad' },
    ],
  },
  {
    id: 'niñero', name: 'Niñero/Niñera', description: 'Cuidás niños para familias del barrio. Alta demanda en barrios residenciales.',
    category: 'informal', baseIncome: 9500, incomeVariance: 0.2,
    requiredSkills: { social: 4 }, unlockLevel: 2, riskLevel: 1, legalStatus: 'gray',
    availableZones: ['palermo','recoleta','belgrano','caballito','nunez'],
    mechanics: [
      { id: 'cuidado_niños', name: 'Turno de cuidado', description: 'Cuidás a los niños mientras los padres trabajan.', cooldownMinutes: 480, successRate: 0.97, rewardRange: [5000, 15000], riskOnFail: 'Incidente con los niños' },
    ],
  },
  {
    id: 'costurera', name: 'Costurera/Sastre', description: 'Hacés arreglos de ropa, confección o diseño.',
    category: 'informal', baseIncome: 8500, incomeVariance: 0.3,
    requiredSkills: { technical: 3 }, unlockLevel: 3, riskLevel: 1, legalStatus: 'gray',
    availableZones: ['once','flores','balvanera','caballito'],
    mechanics: [
      { id: 'arreglo_ropa', name: 'Taller de costura', description: 'Hacés arreglos y confección para clientes.', cooldownMinutes: 180, successRate: 0.95, rewardRange: [3000, 14000], riskOnFail: 'Sin penalidad' },
    ],
  },
  {
    id: 'peluquero_domicilio', name: 'Peluquero a Domicilio', description: 'Cortás el pelo en los domicilios de tus clientes. Comodidad para ellos, flexibilidad para vos.',
    category: 'informal', baseIncome: 10500, incomeVariance: 0.3,
    requiredSkills: { social: 3, technical: 2 }, unlockLevel: 3, riskLevel: 1, legalStatus: 'gray',
    availableZones: ['*'],
    mechanics: [
      { id: 'ronda_cortes', name: 'Ronda de cortes', description: 'Visitás a tus clientes fijos del día.', cooldownMinutes: 240, successRate: 0.97, rewardRange: [5000, 18000], riskOnFail: 'Sin penalidad' },
    ],
  },
  {
    id: 'cuidador_adulto_mayor', name: 'Cuidador de Adultos Mayores', description: 'Acompañás y cuidás personas mayores a domicilio.',
    category: 'informal', baseIncome: 12000, incomeVariance: 0.15,
    requiredSkills: { social: 4, physical: 2 }, unlockLevel: 3, riskLevel: 1, legalStatus: 'gray',
    availableZones: ['*'],
    mechanics: [
      { id: 'turno_cuidado', name: 'Turno de cuidado', description: 'Acompañás al adulto mayor en sus actividades.', cooldownMinutes: 480, successRate: 0.98, rewardRange: [8000, 18000], riskOnFail: 'Sin penalidad' },
    ],
  },
  {
    id: 'puestero_ropa', name: 'Puestero de Ropa', description: 'Vendés ropa en un puesto en La Salada, Indumenta o ferias de barrio.',
    category: 'informal', baseIncome: 13000, incomeVariance: 0.4,
    requiredSkills: { social: 3, street: 2 }, unlockLevel: 3, riskLevel: 2, legalStatus: 'gray',
    availableZones: ['once','flores','liniers','mataderos','constitucion'],
    mechanics: [
      { id: 'dia_venta', name: 'Día de venta', description: 'Atendés el puesto durante la jornada.', cooldownMinutes: 480, successRate: 0.82, rewardRange: [6000, 22000], riskOnFail: 'Decomiso por AFIP o inspector' },
    ],
  },
  {
    id: 'revendedor_entradas', name: 'Revendedor de Entradas', description: 'Comprás entradas y las revendés en la puerta con recargo.',
    category: 'informal', baseIncome: 15000, incomeVariance: 0.6,
    requiredSkills: { street: 4, social: 3 }, unlockLevel: 5, riskLevel: 4, legalStatus: 'gray',
    availableZones: ['*'],
    mechanics: [
      { id: 'reventa_entradas', name: 'Reventa de entradas', description: 'Comprás y revendés entradas en la puerta del evento.', cooldownMinutes: 120, successRate: 0.72, rewardRange: [5000, 40000], riskOnFail: 'Entradas truchas o decomiso' },
    ],
  },
  {
    id: 'cocinero_eventos', name: 'Cocinero de Eventos', description: 'Hacés catering para fiestas, cumpleaños y eventos corporativos.',
    category: 'informal', baseIncome: 18000, incomeVariance: 0.35,
    requiredSkills: { technical: 3, social: 2, physical: 2 }, unlockLevel: 5, riskLevel: 1, legalStatus: 'gray',
    availableZones: ['*'],
    mechanics: [
      { id: 'catering_evento', name: 'Catering de evento', description: 'Preparás y entregás comida para un evento.', cooldownMinutes: 360, successRate: 0.88, rewardRange: [15000, 55000], riskOnFail: 'Intoxicación, responsabilidad' },
    ],
  },

  // =============================================
  // ILEGALES (mecánicas abstractas)
  // =============================================
  {
    id: 'mechero', name: 'Mechero', description: 'Especialista en hurto de oportunidad. El caos de la ciudad es tu oficina.',
    category: 'illegal', baseIncome: 15000, incomeVariance: 0.8,
    requiredSkills: { street: 5, physical: 4 }, unlockLevel: 10, riskLevel: 8, legalStatus: 'illegal',
    availableZones: ['*'],
    mechanics: [
      { id: 'hurto_oportunidad', name: 'Hurto de oportunidad', description: 'Aprovechás un momento de distracción para actuar.', cooldownMinutes: 60, successRate: 0.6, rewardRange: [5000, 30000], riskOnFail: 'Detención policial, pérdida de reputación' },
      { id: 'consorcio_informacion', name: 'Pasar información', description: 'Vendés información de movimientos en la zona.', cooldownMinutes: 120, successRate: 0.75, rewardRange: [3000, 10000], riskOnFail: 'Conflicto con otros ilegales' },
    ],
  },
  {
    id: 'bichicome', name: 'Comerciante Informal de Sustancias', description: 'Operás en zonas grises de la economía de sustancias.',
    category: 'illegal', baseIncome: 40000, incomeVariance: 0.9,
    requiredSkills: { street: 7, social: 4 }, unlockLevel: 20, riskLevel: 10, legalStatus: 'illegal',
    availableZones: ['villa_lugano','villa_soldati','nueva_pompeya','la_boca','constitucion','barracas'],
    mechanics: [
      { id: 'operacion_mercado', name: 'Operación de mercado', description: 'Gestionás una transacción en tu zona de operaciones.', cooldownMinutes: 60, successRate: 0.55, rewardRange: [20000, 100000], riskOnFail: 'Detención con proceso judicial' },
      { id: 'control_territorio', name: 'Control de territorio', description: 'Mantenés el control de tu zona de operaciones.', cooldownMinutes: 240, successRate: 0.7, rewardRange: [15000, 40000], riskOnFail: 'Conflicto con competidores' },
    ],
  },
  {
    id: 'cuentero_tio', name: 'Cuentero del Tío', description: 'Especialista en ingeniería social para estafas de alto rendimiento.',
    category: 'illegal', baseIncome: 50000, incomeVariance: 0.9,
    requiredSkills: { social: 8, intelligence: 6 }, unlockLevel: 25, riskLevel: 9, legalStatus: 'illegal',
    availableZones: ['*'],
    mechanics: [
      { id: 'operacion_cuento', name: 'Operación de engaño', description: 'Ejecutás una operación de ingeniería social sobre un objetivo.', cooldownMinutes: 120, successRate: 0.5, rewardRange: [30000, 200000], riskOnFail: 'Denuncia policial, proceso penal' },
    ],
  },
  {
    id: 'ruletero', name: 'Taxi Pirata', description: 'Hacés viajes sin licencia. Más riesgo, más plata.',
    category: 'illegal', baseIncome: 20000, incomeVariance: 0.5,
    requiredSkills: { street: 4 }, unlockLevel: 5, riskLevel: 5, legalStatus: 'gray',
    availableZones: ['*'],
    mechanics: [
      { id: 'viaje_pirata', name: 'Viaje sin remise', description: 'Hacés un viaje sin habilitación oficial.', cooldownMinutes: 60, successRate: 0.78, rewardRange: [3000, 15000], riskOnFail: 'Multa o secuestro del vehículo' },
    ],
  },
  {
    id: 'mula', name: 'Transportista Anónimo', description: 'Transportás paquetes sin hacer preguntas. La ignorancia a veces es defensa.',
    category: 'illegal', baseIncome: 40000, incomeVariance: 0.8,
    requiredSkills: { street: 5, physical: 3 }, unlockLevel: 15, riskLevel: 9, legalStatus: 'illegal',
    availableZones: ['*'],
    mechanics: [
      { id: 'transporte_anonimo', name: 'Transporte anónimo', description: 'Llevás un paquete a destino sin preguntas.', cooldownMinutes: 90, successRate: 0.6, rewardRange: [25000, 80000], riskOnFail: 'Detención con el paquete' },
    ],
  },
  {
    id: 'colado_profesional', name: 'Especialista en Evasión', description: 'Experto en evadir controles de pago del transporte público.',
    category: 'illegal', baseIncome: 8000, incomeVariance: 0.6,
    requiredSkills: { street: 3 }, unlockLevel: 3, riskLevel: 4, legalStatus: 'illegal',
    availableZones: ['*'],
    mechanics: [
      { id: 'evasion_control', name: 'Evasión de control', description: 'Evadís un sistema de cobro.', cooldownMinutes: 30, successRate: 0.72, rewardRange: [500, 3000], riskOnFail: 'Multa de $5000' },
    ],
  },
  {
    id: 'dealer_trucho', name: 'Comerciante de Falsificaciones', description: 'Vendés mercadería trucha: ropa de marca, electrónicos, accesorios.',
    category: 'illegal', baseIncome: 30000, incomeVariance: 0.7,
    requiredSkills: { social: 4, street: 4 }, unlockLevel: 10, riskLevel: 7, legalStatus: 'illegal',
    availableZones: ['once','liniers','constitucion','flores'],
    mechanics: [
      { id: 'venta_trucha', name: 'Venta de falsos', description: 'Vendés mercadería trucha en tu zona de operaciones.', cooldownMinutes: 180, successRate: 0.65, rewardRange: [10000, 55000], riskOnFail: 'Decomiso y multa alta' },
    ],
  },
  {
    id: 'buchon', name: 'Informante', description: 'Vendés información a quien mejor pague. Policía, prensa, competidores.',
    category: 'illegal', baseIncome: 35000, incomeVariance: 0.7,
    requiredSkills: { intelligence: 5, street: 5, social: 4 }, unlockLevel: 15, riskLevel: 8, legalStatus: 'gray',
    availableZones: ['*'],
    mechanics: [
      { id: 'venta_info', name: 'Venta de información', description: 'Vendés datos confidenciales al mejor postor.', cooldownMinutes: 120, successRate: 0.68, rewardRange: [15000, 60000], riskOnFail: 'Represalias por la información filtrada' },
    ],
  },

  // =============================================
  // POLÍTICOS Y MEDIOS
  // =============================================
  {
    id: 'politico_barrial', name: 'Político Barrial', description: 'Concejal, funcionario menor o candidato. El poder comienza en el barrio.',
    category: 'political', baseIncome: 18000, incomeVariance: 0.4,
    requiredSkills: { social: 7, intelligence: 4 }, unlockLevel: 20, riskLevel: 3, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'gestion_barrial', name: 'Gestión barrial', description: 'Gestionás un problema del barrio para ganar votos.', cooldownMinutes: 180, successRate: 0.82, rewardRange: [10000, 30000], riskOnFail: 'Pérdida de credibilidad política' },
      { id: 'coima_institucional', name: 'Arreglo institucional', description: 'Cerrás un negocio poco transparente con otro funcionario.', cooldownMinutes: 240, successRate: 0.65, rewardRange: [40000, 150000], riskOnFail: 'Escándalo público y proceso judicial' },
    ],
  },
  {
    id: 'puntero', name: 'Puntero Político', description: 'El nexo entre el poder y la gente. Repartís bolsones, conseguís planes y cobrás favores.',
    category: 'political', baseIncome: 14000, incomeVariance: 0.5,
    requiredSkills: { social: 5, street: 5 }, unlockLevel: 10, riskLevel: 4, legalStatus: 'gray',
    availableZones: ['villa_lugano','villa_soldati','nueva_pompeya','barracas','mataderos'],
    mechanics: [
      { id: 'distribucion_recursos', name: 'Distribución de recursos', description: 'Repartís planes, bolsones o medicamentos a cambio de lealtad.', cooldownMinutes: 240, successRate: 0.88, rewardRange: [8000, 25000], riskOnFail: 'Pérdida de influencia' },
    ],
  },
  {
    id: 'sindicalista', name: 'Sindicalista', description: 'Representás a los trabajadores en paritarias y conflictos laborales.',
    category: 'political', baseIncome: 25000, incomeVariance: 0.3,
    requiredSkills: { social: 6, intelligence: 4 }, unlockLevel: 15, riskLevel: 3, legalStatus: 'legal',
    availableZones: ['microcentro','constitucion','san_nicolas'],
    mechanics: [
      { id: 'paritaria', name: 'Negociación paritaria', description: 'Negociás un aumento salarial para tu sector.', cooldownMinutes: 480, successRate: 0.72, rewardRange: [20000, 60000], riskOnFail: 'Fracaso en negociación, pérdida de afiliados' },
    ],
  },
  {
    id: 'periodista', name: 'Periodista', description: 'Reportás hechos, investigás escándalos y exponés lo que el poder quiere ocultar.',
    category: 'media', baseIncome: 16000, incomeVariance: 0.35,
    requiredSkills: { intelligence: 5, social: 5 }, unlockLevel: 10, riskLevel: 4, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'cobertura_noticia', name: 'Cobertura periodística', description: 'Cubrís un hecho de actualidad para tu medio.', cooldownMinutes: 120, successRate: 0.85, rewardRange: [6000, 20000], riskOnFail: 'Sin penalidad económica' },
      { id: 'investigacion', name: 'Investigación periodística', description: 'Investigás un caso de corrupción o irregularidad.', cooldownMinutes: 720, successRate: 0.6, rewardRange: [40000, 120000], riskOnFail: 'Amenazas, pérdida de fuentes' },
    ],
  },
  {
    id: 'influencer', name: 'Influencer', description: 'Creás contenido para redes. En Argentina la economía de la atención explota.',
    category: 'media', baseIncome: 20000, incomeVariance: 0.7,
    requiredSkills: { social: 6, intelligence: 3 }, unlockLevel: 5, riskLevel: 1, legalStatus: 'legal',
    availableZones: ['palermo','recoleta','belgrano'],
    mechanics: [
      { id: 'post_contenido', name: 'Publicar contenido', description: 'Creás y publicás contenido en tus redes.', cooldownMinutes: 120, successRate: 0.88, rewardRange: [2000, 50000], riskOnFail: 'Post negativo, pérdida de seguidores' },
    ],
  },

  // =============================================
  // ESPECIALES
  // =============================================
  {
    id: 'hacker', name: 'Hacker', description: 'Especialista en seguridad informática o intrusión. Mercado enorme y peligroso.',
    category: 'special', baseIncome: 80000, incomeVariance: 0.6,
    requiredSkills: { intelligence: 8, technical: 9 }, unlockLevel: 35, riskLevel: 7, legalStatus: 'gray',
    availableZones: ['*'],
    mechanics: [
      { id: 'pentesting', name: 'Pentesting legal', description: 'Auditás la seguridad de un sistema con permiso.', cooldownMinutes: 480, successRate: 0.88, rewardRange: [60000, 200000], riskOnFail: 'Sin penalidad' },
      { id: 'intrusion', name: 'Intrusión no autorizada', description: 'Accedés a un sistema sin permiso para obtener información.', cooldownMinutes: 240, successRate: 0.55, rewardRange: [80000, 400000], riskOnFail: 'Rastreo y proceso penal' },
    ],
  },
  {
    id: 'prestamista', name: 'Prestamista Informal', description: 'Prestás plata a interés en el barrio. Alta rentabilidad, alta tensión.',
    category: 'special', baseIncome: 35000, incomeVariance: 0.6,
    requiredSkills: { social: 4, street: 5, intelligence: 4 }, unlockLevel: 20, riskLevel: 6, legalStatus: 'gray',
    availableZones: ['*'],
    mechanics: [
      { id: 'prestamo_barrial', name: 'Préstamo informal', description: 'Prestás dinero a un vecino con interés mensual.', cooldownMinutes: 60, successRate: 0.78, rewardRange: [5000, 30000], riskOnFail: 'Deudor que no paga, conflicto' },
    ],
  },
  {
    id: 'espia_industrial', name: 'Espía Industrial', description: 'Recopilás información corporativa confidencial para competidores.',
    category: 'special', baseIncome: 100000, incomeVariance: 0.7,
    requiredSkills: { intelligence: 7, social: 6, street: 4 }, unlockLevel: 40, riskLevel: 9, legalStatus: 'illegal',
    availableZones: ['puerto_madero','microcentro','palermo'],
    mechanics: [
      { id: 'exfiltracion', name: 'Exfiltración de datos', description: 'Conseguís y entregás información corporativa sensible.', cooldownMinutes: 480, successRate: 0.5, rewardRange: [80000, 500000], riskOnFail: 'Proceso penal por espionaje industrial' },
    ],
  },
  {
    id: 'juez', name: 'Juez Federal', description: 'Impartís justicia. O al menos eso deberías hacer.',
    category: 'special', baseIncome: 120000, incomeVariance: 0.1,
    requiredSkills: { intelligence: 9, social: 7 }, unlockLevel: 50, riskLevel: 2, legalStatus: 'legal',
    availableZones: ['microcentro','tribunales'],
    mechanics: [
      { id: 'fallo_judicial', name: 'Dictar sentencia', description: 'Emitís un fallo en una causa importante.', cooldownMinutes: 1440, successRate: 0.92, rewardRange: [80000, 150000], riskOnFail: 'Recusación, escándalo' },
    ],
  },
  {
    id: 'funcionario_corrupto', name: 'Funcionario Corrupto', description: 'Funcionario público con poder para otorgar contratos y licencias a cambio de... colaboración.',
    category: 'special', baseIncome: 50000, incomeVariance: 0.8,
    requiredSkills: { social: 8, intelligence: 5 }, unlockLevel: 30, riskLevel: 8, legalStatus: 'illegal',
    availableZones: ['microcentro','puerto_madero'],
    mechanics: [
      { id: 'coima_contrato', name: 'Arreglo de contrato', description: 'Dirigís licitación a cambio de comisión informal.', cooldownMinutes: 720, successRate: 0.65, rewardRange: [100000, 1000000], riskOnFail: 'Investigación anticorrupción, proceso penal' },
    ],
  },
  {
    id: 'sin_trabajo', name: 'Sin Trabajo', description: 'Por ahora no tenés ocupación fija. Tenés que elegir un rol para empezar a progresar.',
    category: 'informal', baseIncome: 0, incomeVariance: 0,
    requiredSkills: {}, unlockLevel: 1, riskLevel: 0, legalStatus: 'legal',
    availableZones: ['*'],
    mechanics: [
      { id: 'buscar_trabajo', name: 'Buscar trabajo', description: 'Enviás currículums y hacés contactos para conseguir empleo.', cooldownMinutes: 60, successRate: 0.3, rewardRange: [0, 1000], riskOnFail: 'Sin penalidad' },
    ],
  },
];

export function getRoleById(id: string): Role | undefined {
  return ROLES_DATA.find((r) => r.id === id);
}

export function getRolesByCategory(category: string): Role[] {
  return ROLES_DATA.filter((r) => r.category === category);
}

export function getAvailableRoles(userLevel: number): Role[] {
  return ROLES_DATA.filter((r) => r.unlockLevel <= userLevel);
}
