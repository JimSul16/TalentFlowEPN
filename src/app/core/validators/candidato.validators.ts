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
 * Valida formato razonable de teléfono (debe contener entre 7 y 15 dígitos reales, opcional + inicial).
 */
export function telefonoValidoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const valor = String(control.value).trim();
    const regexFormato = /^[+]?[0-9\s-]{7,20}$/;
    const digitos = valor.replace(/\D/g, '');
    if (!regexFormato.test(valor) || digitos.length < 7 || digitos.length > 15) {
      return { telefonoInvalido: true };
    }
    return null;
  };
}

/**
 * Valida formato estricto de correo electrónico con TLD (ej. usuario@dominio.com).
 */
export function correoValidoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const valor = String(control.value).trim();
    const regex = /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(valor)) {
      return { correoInvalido: true };
    }
    return null;
  };
}

/**
 * Valida que el valor sea un número entero (sin decimales).
 */
export function enteroValidoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }
    const num = Number(control.value);
    if (isNaN(num) || !Number.isInteger(num)) {
      return { noEsEntero: true };
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
