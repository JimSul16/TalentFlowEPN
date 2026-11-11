import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  briefcaseOutline,
  calendarOutline,
  callOutline,
  cashOutline,
  checkmarkCircleOutline,
  closeOutline,
  documentTextOutline,
  locationOutline,
  mailOutline,
  personOutline,
  schoolOutline,
} from 'ionicons/icons';

import type { Candidato } from '../../../core/models/candidato.model';

@Component({
  selector: 'app-candidato-detalle',
  templateUrl: './candidato-detalle.component.html',
  styleUrls: ['./candidato-detalle.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonChip,
    IonBadge,
  ],
})
export class CandidatoDetalleComponent {
  @Input({ required: true }) candidato!: Candidato;
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({
      closeOutline,
      personOutline,
      mailOutline,
      callOutline,
      calendarOutline,
      briefcaseOutline,
      schoolOutline,
      cashOutline,
      documentTextOutline,
      checkmarkCircleOutline,
      locationOutline,
    });
  }

  cerrar(): Promise<boolean> {
    return this.modalCtrl.dismiss();
  }

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return 'No especificada';
    const partes = String(fecha).split('T')[0].split('-');
    if (partes.length === 3) {
      const [year, month, day] = partes;
      return `${day}/${month}/${year}`;
    }
    return String(fecha);
  }

  formatearSalario(salario: number | null | undefined): string {
    if (salario === null || salario === undefined) return '$0.00 USD';
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(salario));
  }
}
