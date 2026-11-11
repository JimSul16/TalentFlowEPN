import { Injectable } from '@angular/core';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';

import { db } from '../core/firebase/firebase.config';
import type { Candidato } from '../core/models/candidato.model';

@Injectable({
  providedIn: 'root',
})
export class CandidatosService {
  private readonly coleccionNombre = 'candidatos';

  /**
   * Guarda un nuevo candidato en la colección de Firestore.
   * Asigna automáticamente la marca de tiempo de creación con serverTimestamp().
   */
  async crear(candidato: Omit<Candidato, 'id' | 'creadoEn'>): Promise<string> {
    try {
      const colRef = collection(db, this.coleccionNombre);
      const docData = {
        ...candidato,
        creadoEn: serverTimestamp(),
      };
      const docRef = await addDoc(colRef, docData);
      return docRef.id;
    } catch (error: any) {
      throw new Error(this.traducirError(error), { cause: error });
    }
  }

  /**
   * Obtiene la lista completa de candidatos almacenados en Firestore.
   */
  async listar(): Promise<Candidato[]> {
    try {
      const colRef = collection(db, this.coleccionNombre);
      let snapshot;
      try {
        const q = query(colRef, orderBy('creadoEn', 'desc'));
        snapshot = await getDocs(q);
      } catch {
        snapshot = await getDocs(colRef);
      }

      return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          id: doc.id,
          nombres: data['nombres'] ?? '',
          correo: data['correo'] ?? '',
          telefono: data['telefono'] ?? '',
          fechaNacimiento: data['fechaNacimiento'] ?? '',
          cargo: data['cargo'] ?? 'Desarrollador móvil',
          nivelAcademico: data['nivelAcademico'] ?? 'Tercer nivel',
          experienciaAnios: Number(data['experienciaAnios'] ?? 0),
          modalidad: data['modalidad'] ?? 'Presencial',
          habilidades: Array.isArray(data['habilidades']) ? data['habilidades'] : [],
          fechaDisponibilidad: data['fechaDisponibilidad'] ?? '',
          aspiracionSalarial: Number(data['aspiracionSalarial'] ?? 0),
          resumen: data['resumen'] ?? '',
          consentimiento: Boolean(data['consentimiento']),
          creadoEn: data['creadoEn'] ?? null,
        } as Candidato;
      });
    } catch (error: any) {
      throw new Error(this.traducirError(error), { cause: error });
    }
  }

  /**
   * Traduce códigos de error comunes de Firebase a mensajes legibles en español.
   */
  private traducirError(error: any): string {
    const code = error?.code || '';
    if (code === 'permission-denied') {
      return 'Acceso denegado. Las reglas de seguridad de Firestore rechazaron la operación.';
    }
    if (code === 'unavailable') {
      return 'El servicio de base de datos no está disponible. Revisa tu conexión a internet.';
    }
    if (code === 'not-found') {
      return 'No se encontró el registro solicitado.';
    }
    return error?.message || 'Ocurrió un error inesperado al procesar la solicitud.';
  }
}
