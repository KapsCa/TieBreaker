import { PresetTemplate } from '../types';

export const DECISION_PRESETS: PresetTemplate[] = [
  {
    id: 'career-job-offer',
    icon: 'Briefcase',
    category: 'Carrera y Trabajo',
    title: '¿Aceptar una nueva oferta laboral o quedarme en mi puesto actual?',
    context: 'Llevo 3 años en mi puesto actual con buena estabilidad y equipo cómodo, pero recibí una oferta en una startup con un 30% más de salario, trabajo híbrido y mayores desafíos pero menos certeza a largo plazo.',
    options: [
      'Aceptar la oferta en la nueva empresa',
      'Permanecer en la empresa actual y pedir ascenso',
      'Negociar contraoferta con mi empleador actual'
    ],
    criteria: [
      { name: 'Crecimiento y Aprendizaje Profesional', weight: 5 },
      { name: 'Compensación Económica y Beneficios', weight: 4 },
      { name: 'Estabilidad y Seguridad Laboral', weight: 3 },
      { name: 'Equilibrio Vida-Trabajo y Bienestar', weight: 4 },
      { name: 'Cultura de Equipo y Liderazgo', weight: 4 }
    ]
  },
  {
    id: 'housing-buy-vs-rent',
    icon: 'Home',
    category: 'Vivienda y Finanzas',
    title: '¿Comprar una propiedad con hipoteca o seguir alquilando e invertir el capital?',
    context: 'Tengo ahorrado el enganche inicial para una vivienda. Los tipos de interés están moderados. No tengo certeza si residiré en la misma ciudad en 5 años.',
    options: [
      'Comprar vivienda con hipoteca a 25 años',
      'Alquilar departamento e invertir el ahorro en fondos indexados'
    ],
    criteria: [
      { name: 'Construcción de Patrimonio Neto', weight: 5 },
      { name: 'Flexibilidad Geográfica y de Vida', weight: 4 },
      { name: 'Costes Fijos Mensuales y Mantenimiento', weight: 3 },
      { name: 'Paz Mental y Sentido de Pertenencia', weight: 4 },
      { name: 'Riesgo y Liquidez Financiera', weight: 4 }
    ]
  },
  {
    id: 'business-pivot-vs-scale',
    icon: 'TrendingUp',
    category: 'Negocios y Startups',
    title: '¿Lanzar una nueva línea de producto innovadora o duplicar la inversión en el producto estrella?',
    context: 'Nuestra empresa tiene un producto consolidado que genera ingresos constantes pero cuyo crecimiento se ha desacelerado. Tenemos fondos limitados para el próximo trimestre.',
    options: [
      'Lanzar la nueva línea de producto innovadora',
      'Optimizar y escalar el producto existente',
      'Hacer una prueba piloto de bajo presupuesto (MVP)'
    ],
    criteria: [
      { name: 'Potencial de Ingresos a 3 años', weight: 5 },
      { name: 'Riesgo de Ejecución y Pérdidas', weight: 4 },
      { name: 'Tiempo de Retorno de Inversión (ROI)', weight: 4 },
      { name: 'Alineación con Habilidades del Equipo', weight: 3 },
      { name: 'Ventaja Competitiva y Barreras', weight: 4 }
    ]
  },
  {
    id: 'tech-stack-choice',
    icon: 'Code',
    category: 'Tecnología e Ingeniería',
    title: '¿Reescribir la arquitectura a microservicios o refactorizar el monolito actual?',
    context: 'El sistema actual tiene 6 años y presenta cuellos de botella en picos de tráfico, pero el equipo domina el stack monolítico y los plazos de entrega del cliente son exigentes.',
    options: [
      'Migrar progresivamente a microservicios distribuidos',
      'Refactorizar y modularizar el monolito actual (Modular Monolith)'
    ],
    criteria: [
      { name: 'Escalabilidad Técnica y Rendimiento', weight: 4 },
      { name: 'Velocidad de Entrega a Corto Plazo', weight: 5 },
      { name: 'Complejidad Operativa y Mantenimiento', weight: 4 },
      { name: 'Curva de Aprendizaje del Equipo', weight: 3 },
      { name: 'Costo de Infraestructura en la Nube', weight: 3 }
    ]
  },
  {
    id: 'education-masters-vs-experience',
    icon: 'GraduationCap',
    category: 'Educación y Desarrollo',
    title: '¿Estudiar una maestría a tiempo completo o continuar trabajando y ganar experiencia práctica?',
    context: 'Fui admitido en un programa de maestría prestigioso en el extranjero. Requiere una inversión considerable y pausar mi empleo por 1 año y medio.',
    options: [
      'Estudiar la maestría presencial a tiempo completo',
      'Continuar trabajando y cursar certificaciones / máster online',
      'Buscar un programa con beca o posponerlo 1 año'
    ],
    criteria: [
      { name: 'Retorno de Inversión y Salario Futuro', weight: 4 },
      { name: 'Red de Contactos (Networking)', weight: 5 },
      { name: 'Costo Total y Deuda Financiera', weight: 4 },
      { name: 'Experiencia Internacional y Personal', weight: 4 },
      { name: 'Costo de Oportunidad Laboral', weight: 3 }
    ]
  }
];
