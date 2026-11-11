import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { serverTimestamp } from 'firebase/firestore';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

/**
 * Suite oficial de verificación de reglas de seguridad Firestore (firestore.rules).
 * Ejecutada contra el emulador real de Google Cloud Firestore mediante @firebase/rules-unit-testing.
 */
describe.skipIf(!process.env['FIRESTORE_EMULATOR_HOST'])('Firestore Security Rules (firestore.rules)', () => {
  let testEnv: RulesTestEnvironment;

  const candidatoValido = {
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
    creadoEn: serverTimestamp(),
  };

  beforeAll(async () => {
    if (!process.env['FIRESTORE_EMULATOR_HOST']) {
      return;
    }
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');

    testEnv = await initializeTestEnvironment({
      projectId: 'talentflowepn-rules-test',
      firestore: {
        rules,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  it('permite crear un candidato válido con serverTimestamp() y campos del catálogo', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const docRef = db.collection('candidatos').doc('cand-valido-1');
    await assertSucceeds(docRef.set(candidatoValido));
  });

  it('rechaza si falta un campo requerido (esquema cerrado)', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const docRef = db.collection('candidatos').doc('cand-incompleto');
    const { correo: _correo, ...incompleto } = candidatoValido;
    await assertFails(docRef.set(incompleto));
  });

  it('rechaza campos extra no autorizados (protección anti-inyección)', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const docRef = db.collection('candidatos').doc('cand-extra-field');
    const conCampoExtra = { ...candidatoValido, admin: true };
    await assertFails(docRef.set(conCampoExtra));
  });

  it('rechaza habilidades no permitidas en el catálogo oficial', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const docRef = db.collection('candidatos').doc('cand-habilidad-invalida');
    const conHabilidadInvalida = {
      ...candidatoValido,
      habilidades: ['Angular', 'HackingTool123'],
    };
    await assertFails(docRef.set(conHabilidadInvalida));
  });

  it('rechaza teléfonos sin dígitos válidos o formato inconsistente', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const docRef = db.collection('candidatos').doc('cand-tel-invalido');
    const conTelInvalido = {
      ...candidatoValido,
      telefono: '-------',
    };
    await assertFails(docRef.set(conTelInvalido));
  });

  it('rechaza años de experiencia decimales o no enteros', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const docRef = db.collection('candidatos').doc('cand-exp-decimal');
    const conDecimal = {
      ...candidatoValido,
      experienciaAnios: 2.5,
    };
    await assertFails(docRef.set(conDecimal));
  });

  it('rechaza si el consentimiento es false', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const docRef = db.collection('candidatos').doc('cand-sin-consentimiento');
    const sinConsentimiento = {
      ...candidatoValido,
      consentimiento: false,
    };
    await assertFails(docRef.set(sinConsentimiento));
  });

  it('rechaza timestamps falsificados por el cliente (debe ser serverTimestamp)', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const docRef = db.collection('candidatos').doc('cand-timestamp-falso');
    const conTimestampFalso = {
      ...candidatoValido,
      creadoEn: '2026-11-11T12:00:00Z',
    };
    await assertFails(docRef.set(conTimestampFalso));
  });

  it('prohíbe estrictamente actualizaciones y borrados (inmutabilidad de auditoría)', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const docRef = db.collection('candidatos').doc('cand-inmutable');
    await assertSucceeds(docRef.set(candidatoValido));
    await assertFails(docRef.update({ aspiracionSalarial: 9999 }));
    await assertFails(docRef.delete());
  });

  it('permite la lectura pública para la consulta del listado y detalle', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const docRef = db.collection('candidatos').doc('cand-lectura');
    await assertSucceeds(docRef.set(candidatoValido));
    await assertSucceeds(docRef.get());
  });
});
