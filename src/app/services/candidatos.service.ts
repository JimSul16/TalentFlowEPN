import { Injectable } from '@angular/core';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';

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
    } catch (error: unknown) {
      throw new Error(this.traducirError(error), { cause: error });
    }
  }

  /**
   * Obtiene la lista de candidatos almacenados en Firestore (ordenados y con límite defensivo).
   */
  async listar(): Promise<Candidato[]> {
    try {
      const colRef = collection(db, this.coleccionNombre);
      let snapshot;
      try {
        const q = query(colRef, orderBy('creadoEn', 'desc'), limit(50));
        snapshot = await getDocs(q);
      } catch {
        const fallbackQuery = query(colRef, limit(50));
        snapshot = await getDocs(fallbackQuery);
      }

      return snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
        return this.mapearDocumento(docSnap.id, docSnap.data());
      });
    } catch (error: unknown) {
      throw new Error(this.traducirError(error), { cause: error });
    }
  }

  /**
   * Obtiene un candidato por su ID de documento en Firestore.
   */
  async obtenerPorId(id: string): Promise<Candidato> {
    try {
      const docRef = doc(db, this.coleccionNombre, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('No se encontró el candidato solicitado.');
      }
      return this.mapearDocumento(docSnap.id, docSnap.data());
    } catch (error: unknown) {
      throw new Error(this.traducirError(error), { cause: error });
    }
  }

  /**
   * Mapea un DocumentData de Firestore al modelo tipado Candidato.
   */
  private mapearDocumento(id: string, data: DocumentData): Candidato {
    return {
      id,
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
    };
  }

  /**
   * Traduce códigos de error comunes de Firebase a mensajes legibles en español.
   */
  private traducirError(error: unknown): string {
    const err = error as { code?: string; message?: string };
    const code = err?.code || '';
    if (code === 'permission-denied') {
      return 'Acceso denegado. Las reglas de seguridad de Firestore rechazaron la operación.';
    }
    if (code === 'unavailable') {
      return 'El servicio de base de datos no está disponible. Revisa tu conexión a internet.';
    }
    if (code === 'not-found' || err?.message?.includes('No se encontró')) {
      return 'No se encontró el registro solicitado.';
    }
    return 'Ocurrió un error al comunicarse con la base de datos de Firestore.';
  }
}
