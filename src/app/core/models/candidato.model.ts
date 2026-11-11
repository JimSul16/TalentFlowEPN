import type { Timestamp } from 'firebase/firestore';

export type Cargo = 'Desarrollador móvil' | 'Analista de datos' | 'Diseñador UX/UI' | 'Soporte TI';

export type NivelAcademico = 'Bachillerato' | 'Tecnología' | 'Tercer nivel' | 'Posgrado';

export type Modalidad = 'Presencial' | 'Híbrida' | 'Remota';

export type Habilidad = 'Angular' | 'Ionic' | 'JavaScript' | 'Python' | 'SQL' | 'Git' | 'Firebase';

export interface Candidato {
  id?: string;
  nombres: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string; // Formato YYYY-MM-DD
  cargo: Cargo;
  nivelAcademico: NivelAcademico;
  experienciaAnios: number;
  modalidad: Modalidad;
  habilidades: Habilidad[];
  fechaDisponibilidad: string; // Formato YYYY-MM-DD
  aspiracionSalarial: number; // USD
  resumen: string;
  consentimiento: boolean;
  creadoEn?: Timestamp | string | null;
}
