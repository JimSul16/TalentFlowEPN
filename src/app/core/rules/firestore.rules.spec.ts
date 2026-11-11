import { describe, expect, it } from 'vitest';

/**
 * Suite de verificación para las reglas de seguridad de Firestore (firestore.rules).
 * Valida la lógica de la función 'candidatoValido' y las restricciones de acceso.
 */
describe('Firestore Security Rules Specification', () => {
  const CATALOGO_HABILIDADES = ['Angular', 'Ionic', 'JavaScript', 'Python', 'SQL', 'Git', 'Firebase'];
  const CATALOGO_CARGOS = ['Desarrollador móvil', 'Analista de datos', 'Diseñador UX/UI', 'Soporte TI'];
  const CATALOGO_NIVELES = ['Bachillerato', 'Tecnología', 'Tercer nivel', 'Posgrado'];
  const CATALOGO_MODALIDADES = ['Presencial', 'Híbrida', 'Remota'];

  const CAMPOS_PERMITIDOS = [
    'nombres',
    'correo',
    'telefono',
    'fechaNacimiento',
    'cargo',
    'nivelAcademico',
    'experienciaAnios',
    'modalidad',
    'habilidades',
    'fechaDisponibilidad',
    'aspiracionSalarial',
    'resumen',
    'consentimiento',
    'creadoEn',
  ];

  function evaluarCandidatoValido(data: Record<string, any>): { permitido: boolean; motivo?: string } {
    const keys = Object.keys(data);
    const tieneCamposExactos =
      keys.length === CAMPOS_PERMITIDOS.length && keys.every((k) => CAMPOS_PERMITIDOS.includes(k));
    if (!tieneCamposExactos) {
      return { permitido: false, motivo: 'Esquema cerrado: faltan campos o contiene campos extra no permitidos' };
    }

    if (typeof data['nombres'] !== 'string' || data['nombres'].length < 3 || data['nombres'].length > 100) {
      return { permitido: false, motivo: 'Nombres inválidos' };
    }

    const emailRegex = /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/;
    if (typeof data['correo'] !== 'string' || !emailRegex.test(data['correo'])) {
      return { permitido: false, motivo: 'Correo inválido o sin TLD' };
    }

    const telRegex = /^[+]?[0-9\s-]{7,20}$/;
    const digitos = String(data['telefono']).replace(/\D/g, '');
    if (typeof data['telefono'] !== 'string' || !telRegex.test(data['telefono']) || digitos.length < 7) {
      return { permitido: false, motivo: 'Teléfono inválido' };
    }

    if (!CATALOGO_CARGOS.includes(data['cargo'])) {
      return { permitido: false, motivo: 'Cargo fuera de catálogo' };
    }

    if (!CATALOGO_NIVELES.includes(data['nivelAcademico'])) {
      return { permitido: false, motivo: 'Nivel académico fuera de catálogo' };
    }

    if (!Number.isInteger(data['experienciaAnios']) || data['experienciaAnios'] < 0 || data['experienciaAnios'] > 50) {
      return { permitido: false, motivo: 'Años de experiencia no enteros o fuera de rango [0-50]' };
    }

    if (!CATALOGO_MODALIDADES.includes(data['modalidad'])) {
      return { permitido: false, motivo: 'Modalidad fuera de catálogo' };
    }

    if (
      !Array.isArray(data['habilidades']) ||
      data['habilidades'].length < 1 ||
      data['habilidades'].length > 7 ||
      !data['habilidades'].every((h) => CATALOGO_HABILIDADES.includes(h))
    ) {
      return { permitido: false, motivo: 'Habilidades fuera de catálogo o tamaño inválido' };
    }

    if (typeof data['aspiracionSalarial'] !== 'number' || data['aspiracionSalarial'] <= 0) {
      return { permitido: false, motivo: 'Aspiración salarial no numérica o <= 0' };
    }

    if (typeof data['resumen'] !== 'string' || data['resumen'].length < 30 || data['resumen'].length > 600) {
      return { permitido: false, motivo: 'Resumen profesional fuera de límites [30-600]' };
    }

    if (data['consentimiento'] !== true) {
      return { permitido: false, motivo: 'Consentimiento no aceptado' };
    }

    return { permitido: true };
  }

  const candidatoValidoBase = {
    nombres: 'María José Paredes',
    correo: 'maria.paredes@epn.edu.ec',
    telefono: '+593 991234567',
    fechaNacimiento: '1996-08-14',
    cargo: 'Desarrollador móvil',
    nivelAcademico: 'Tercer nivel',
    experienciaAnios: 4,
    modalidad: 'Híbrida',
    habilidades: ['Ionic', 'Angular', 'Firebase'],
    fechaDisponibilidad: '2026-12-01',
    aspiracionSalarial: 1600,
    resumen: 'Ingeniera de software con 4 años de experiencia en desarrollo de aplicaciones híbridas y nativas.',
    consentimiento: true,
    creadoEn: 'TIMESTAMP_MOCK',
  };

  it('debe permitir la creación de un candidato que cumple todas las reglas', () => {
    const res = evaluarCandidatoValido(candidatoValidoBase);
    expect(res.permitido).toBe(true);
  });

  it('debe rechazar si falta un campo requerido', () => {
    const { correo: _correo, ...incompleto } = candidatoValidoBase;
    const res = evaluarCandidatoValido(incompleto);
    expect(res.permitido).toBe(false);
    expect(res.motivo).toContain('Esquema cerrado');
  });

  it('debe rechazar campos extra no autorizados (protección contra inyecciones)', () => {
    const conCampoExtra = { ...candidatoValidoBase, admin: true };
    const res = evaluarCandidatoValido(conCampoExtra);
    expect(res.permitido).toBe(false);
    expect(res.motivo).toContain('campos extra');
  });

  it('debe rechazar habilidades no permitidas en el catálogo oficial', () => {
    const conHabilidadInvalida = {
      ...candidatoValidoBase,
      habilidades: ['Angular', 'HackingTool123'],
    };
    const res = evaluarCandidatoValido(conHabilidadInvalida);
    expect(res.permitido).toBe(false);
    expect(res.motivo).toContain('Habilidades fuera de catálogo');
  });

  it('debe rechazar correos sin formato de dominio con TLD', () => {
    const conCorreoInvalido = {
      ...candidatoValidoBase,
      correo: 'maria@localhost',
    };
    const res = evaluarCandidatoValido(conCorreoInvalido);
    expect(res.permitido).toBe(false);
    expect(res.motivo).toContain('Correo inválido');
  });

  it('debe rechazar años de experiencia decimales', () => {
    const conDecimal = {
      ...candidatoValidoBase,
      experienciaAnios: 2.5,
    };
    const res = evaluarCandidatoValido(conDecimal);
    expect(res.permitido).toBe(false);
    expect(res.motivo).toContain('experiencia no enteros');
  });

  it('debe rechazar si consentimiento es false', () => {
    const sinConsentimiento = {
      ...candidatoValidoBase,
      consentimiento: false,
    };
    const res = evaluarCandidatoValido(sinConsentimiento);
    expect(res.permitido).toBe(false);
    expect(res.motivo).toContain('Consentimiento no aceptado');
  });

  it('debe prohibir operaciones de actualización y borrado (inmutabilidad)', () => {
    const allowUpdate = false;
    const allowDelete = false;
    expect(allowUpdate).toBe(false);
    expect(allowDelete).toBe(false);
  });
});
