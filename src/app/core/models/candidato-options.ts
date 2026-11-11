import type { Cargo, NivelAcademico, Modalidad, Habilidad } from './candidato.model';

export const CARGOS_DISPONIBLES: Cargo[] = [
  'Desarrollador móvil',
  'Analista de datos',
  'Diseñador UX/UI',
  'Soporte TI',
];

export const NIVELES_ACADEMICOS: NivelAcademico[] = ['Bachillerato', 'Tecnología', 'Tercer nivel', 'Posgrado'];

export const MODALIDADES_TRABAJO: Modalidad[] = ['Presencial', 'Híbrida', 'Remota'];

export const HABILIDADES_TECNICAS: Habilidad[] = ['Angular', 'Ionic', 'JavaScript', 'Python', 'SQL', 'Git', 'Firebase'];
