import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Obtiene la fecha actual en formato ISO 'YYYY-MM-DD' en la zona horaria local.
 */
export function getFechaHoyISO(): string {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Valida que una fecha no sea futura (ideal para fecha de nacimiento).
 */
export function fechaNoFuturaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const fechaSeleccionada = String(control.value).split('T')[0];
    const hoy = getFechaHoyISO();
    if (fechaSeleccionada > hoy) {
      return { fechaFutura: { value: control.value, max: hoy } };
    }
    return null;
  };
}

/**
 * Valida que una fecha no sea anterior a hoy (ideal para fecha de disponibilidad).
 */
export function fechaNoPasadaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const fechaSeleccionada = String(control.value).split('T')[0];
    const hoy = getFechaHoyISO();
    if (fechaSeleccionada < hoy) {
      return { fechaPasada: { value: control.value, min: hoy } };
    }
    return null;
  };
}

/**
 * Valida formato razonable de teléfono (entre 7 y 15 dígitos numéricos, opcional + inicial).
 */
export function telefonoValidoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const valor = String(control.value).trim();
    const regex = /^[+]?[0-9\s-]{7,15}$/;
    if (!regex.test(valor)) {
      return { telefonoInvalido: true };
    }
    return null;
  };
}

/**
 * Valida que se haya seleccionado al menos una habilidad.
 */
export function alMenosUnaHabilidadValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (!Array.isArray(valor) || valor.length === 0) {
      return { sinHabilidades: true };
    }
    return null;
  };
}
