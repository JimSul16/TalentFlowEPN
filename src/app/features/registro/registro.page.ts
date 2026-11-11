import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import type { FormGroup } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCheckbox,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonNote,
  IonRadio,
  IonRadioGroup,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  briefcaseOutline,
  calendarOutline,
  callOutline,
  cashOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  mailOutline,
  personOutline,
  schoolOutline,
  sendOutline,
} from 'ionicons/icons';

import {
  CARGOS_DISPONIBLES,
  HABILIDADES_TECNICAS,
  MODALIDADES_TRABAJO,
  NIVELES_ACADEMICOS,
} from '../../core/models/candidato-options';
import {
  alMenosUnaHabilidadValidator,
  correoValidoValidator,
  enteroValidoValidator,
  fechaNoFuturaValidator,
  fechaNoPasadaValidator,
  getFechaHoyISO,
  telefonoValidoValidator,
} from '../../core/validators/candidato.validators';
import { CandidatosService } from '../../services/candidatos.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonRadioGroup,
    IonRadio,
    IonSegment,
    IonSegmentButton,
    IonCheckbox,
    IonButton,
    IonSpinner,
    IonIcon,
    IonNote,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
  ],
})
export class RegistroPage {
  private fb = inject(FormBuilder);
  private candidatosService = inject(CandidatosService);
  private toastController = inject(ToastController);
  private router = inject(Router);

  candidatoForm: FormGroup;
  guardando = signal<boolean>(false);

  // Catálogos
  cargos = CARGOS_DISPONIBLES;
  niveles = NIVELES_ACADEMICOS;
  modalidades = MODALIDADES_TRABAJO;
  habilidadesLista = HABILIDADES_TECNICAS;

  fechaHoy = getFechaHoyISO();

  constructor() {
    addIcons({
      personOutline,
      mailOutline,
      callOutline,
      calendarOutline,
      briefcaseOutline,
      schoolOutline,
      cashOutline,
      documentTextOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      sendOutline,
    });

    this.candidatoForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      correo: ['', [Validators.required, correoValidoValidator()]],
      telefono: ['', [Validators.required, telefonoValidoValidator()]],
      fechaNacimiento: ['', [Validators.required, fechaNoFuturaValidator()]],
      cargo: ['', Validators.required],
      nivelAcademico: ['', Validators.required],
      experienciaAnios: [0, [Validators.required, Validators.min(0), Validators.max(50), enteroValidoValidator()]],
      modalidad: ['Presencial', Validators.required],
      habilidades: [[], alMenosUnaHabilidadValidator()],
      fechaDisponibilidad: ['', [Validators.required, fechaNoPasadaValidator()]],
      aspiracionSalarial: [null, [Validators.required, Validators.min(1)]],
      resumen: ['', [Validators.required, Validators.minLength(30), Validators.maxLength(600)]],
      consentimiento: [false, Validators.requiredTrue],
    });
  }

  /**
   * Gestiona la selección / deselección de una habilidad técnica.
   */
  onHabilidadChange(habilidad: string, event: CustomEvent): void {
    const checked = event.detail.checked;
    const current: string[] = this.candidatoForm.get('habilidades')?.value || [];
    let updated: string[];

    if (checked) {
      updated = current.includes(habilidad) ? current : [...current, habilidad];
    } else {
      updated = current.filter((h) => h !== habilidad);
    }

    this.candidatoForm.patchValue({ habilidades: updated });
    this.candidatoForm.get('habilidades')?.markAsTouched();
  }

  isHabilidadSelected(habilidad: string): boolean {
    const current: string[] = this.candidatoForm.get('habilidades')?.value || [];
    return current.includes(habilidad);
  }

  /**
   * Envía el formulario a Firestore con validación defensiva previa.
   */
  async onSubmit(): Promise<void> {
    if (this.candidatoForm.invalid) {
      this.candidatoForm.markAllAsTouched();
      await this.mostrarToast('Por favor completa todos los campos obligatorios correctamente.', 'warning');
      return;
    }

    this.guardando.set(true);

    try {
      const formValue = this.candidatoForm.value;
      const payload = {
        nombres: formValue.nombres.trim(),
        correo: formValue.correo.trim().toLowerCase(),
        telefono: formValue.telefono.trim(),
        fechaNacimiento: String(formValue.fechaNacimiento).split('T')[0],
        cargo: formValue.cargo,
        nivelAcademico: formValue.nivelAcademico,
        experienciaAnios: Number(formValue.experienciaAnios),
        modalidad: formValue.modalidad,
        habilidades: formValue.habilidades,
        fechaDisponibilidad: String(formValue.fechaDisponibilidad).split('T')[0],
        aspiracionSalarial: Number(formValue.aspiracionSalarial),
        resumen: formValue.resumen.trim(),
        consentimiento: Boolean(formValue.consentimiento),
      };

      await this.candidatosService.crear(payload);
      await this.mostrarToast('¡Candidato registrado con éxito en Firestore!', 'success');
      this.resetForm();
      await this.router.navigate(['/tabs/candidatos']);
    } catch (error: any) {
      await this.mostrarToast(error.message || 'Error al guardar el candidato.', 'danger');
    } finally {
      this.guardando.set(false);
    }
  }

  /**
   * Restablece el formulario a sus valores iniciales limpios.
   */
  resetForm(): void {
    this.candidatoForm.reset({
      nombres: '',
      correo: '',
      telefono: '',
      fechaNacimiento: '',
      cargo: '',
      nivelAcademico: '',
      experienciaAnios: 0,
      modalidad: 'Presencial',
      habilidades: [],
      fechaDisponibilidad: '',
      aspiracionSalarial: null,
      resumen: '',
      consentimiento: false,
    });
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3500,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }
}
