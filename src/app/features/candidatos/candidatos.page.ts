import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  chevronForwardOutline,
  peopleOutline,
  personAddOutline,
  refreshOutline,
  timeOutline,
} from 'ionicons/icons';

import type { Candidato } from '../../core/models/candidato.model';
import { CandidatosService } from '../../services/candidatos.service';

import { CandidatoDetalleComponent } from './candidato-detalle/candidato-detalle.component';

@Component({
  selector: 'app-candidatos',
  templateUrl: './candidatos.page.html',
  styleUrls: ['./candidatos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonBadge,
    IonChip,
    IonSkeletonText,
  ],
})
export class CandidatosPage {
  private candidatosService = inject(CandidatosService);
  private modalCtrl = inject(ModalController);
  private router = inject(Router);

  candidatos = signal<Candidato[]>([]);
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor() {
    addIcons({
      peopleOutline,
      refreshOutline,
      alertCircleOutline,
      chevronForwardOutline,
      personAddOutline,
      timeOutline,
    });
  }

  /**
   * Se ejecuta automáticamente al ingresar a la pestaña para refrescar los datos.
   */
  ionViewWillEnter(): void {
    void this.cargarCandidatos();
  }

  /**
   * Carga los candidatos desde Firestore.
   */
  async cargarCandidatos(event?: CustomEvent): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const data = await this.candidatosService.listar();
      this.candidatos.set(data);
    } catch (err: any) {
      this.error.set(err.message || 'Error al obtener la lista de candidatos.');
    } finally {
      this.cargando.set(false);
      if (event) {
        (event.target as HTMLIonRefresherElement).complete();
      }
    }
  }

  /**
   * Abre el modal de detalle completo del candidato seleccionado.
   */
  async verDetalle(candidato: Candidato): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CandidatoDetalleComponent,
      componentProps: { candidato },
    });
    await modal.present();
  }

  irARegistro(): void {
    void this.router.navigate(['/tabs/registro']);
  }
}
