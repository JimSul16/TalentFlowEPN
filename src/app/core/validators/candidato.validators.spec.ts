import { FormControl } from '@angular/forms';

import {
  fechaNoFuturaValidator,
  fechaNoPasadaValidator,
  telefonoValidoValidator,
  alMenosUnaHabilidadValidator,
  correoValidoValidator,
  enteroValidoValidator,
} from './candidato.validators';

describe('CandidatoValidators', () => {
  describe('fechaNoFuturaValidator', () => {
    it('debe permitir fecha de nacimiento pasada', () => {
      const control = new FormControl('2000-01-01');
      const validator = fechaNoFuturaValidator();
      expect(validator(control)).toBeNull();
    });

    it('debe rechazar fecha futura', () => {
      const control = new FormControl('2099-12-31');
      const validator = fechaNoFuturaValidator();
      const res = validator(control);
      expect(res).not.toBeNull();
      expect(res?.['fechaFutura']).toBeDefined();
    });
  });

  describe('fechaNoPasadaValidator', () => {
    it('debe permitir fecha de disponibilidad futura', () => {
      const control = new FormControl('2099-12-31');
      const validator = fechaNoPasadaValidator();
      expect(validator(control)).toBeNull();
    });

    it('debe rechazar fecha pasada', () => {
      const control = new FormControl('1990-01-01');
      const validator = fechaNoPasadaValidator();
      const res = validator(control);
      expect(res).not.toBeNull();
      expect(res?.['fechaPasada']).toBeDefined();
    });
  });

  describe('telefonoValidoValidator', () => {
    it('debe aceptar teléfonos válidos de 7 a 15 dígitos', () => {
      const validator = telefonoValidoValidator();
      expect(validator(new FormControl('0990000000'))).toBeNull();
      expect(validator(new FormControl('+593990000000'))).toBeNull();
      expect(validator(new FormControl('02 2991 700'))).toBeNull();
    });

    it('debe rechazar números con letras o muy cortos', () => {
      const validator = telefonoValidoValidator();
      expect(validator(new FormControl('123'))).toEqual({ telefonoInvalido: true });
      expect(validator(new FormControl('099abc000'))).toEqual({ telefonoInvalido: true });
    });

    it('debe rechazar cadenas sin dígitos como guiones o espacios (M-01)', () => {
      const validator = telefonoValidoValidator();
      expect(validator(new FormControl('-------'))).toEqual({ telefonoInvalido: true });
      expect(validator(new FormControl('       '))).toEqual({ telefonoInvalido: true });
    });
  });

  describe('correoValidoValidator', () => {
    it('debe aceptar correos con dominio y TLD válido', () => {
      const validator = correoValidoValidator();
      expect(validator(new FormControl('test@talentflow.com'))).toBeNull();
      expect(validator(new FormControl('docente.movil@epn.edu.ec'))).toBeNull();
    });

    it('debe rechazar correos sin punto o sin dominio válido', () => {
      const validator = correoValidoValidator();
      expect(validator(new FormControl('sin-arroba'))).toEqual({ correoInvalido: true });
      expect(validator(new FormControl('usuario@localhost'))).toEqual({ correoInvalido: true });
    });
  });

  describe('enteroValidoValidator', () => {
    it('debe aceptar números enteros', () => {
      const validator = enteroValidoValidator();
      expect(validator(new FormControl(0))).toBeNull();
      expect(validator(new FormControl(5))).toBeNull();
      expect(validator(new FormControl('10'))).toBeNull();
    });

    it('debe rechazar decimales', () => {
      const validator = enteroValidoValidator();
      expect(validator(new FormControl(1.5))).toEqual({ noEsEntero: true });
      expect(validator(new FormControl('3.2'))).toEqual({ noEsEntero: true });
    });
  });

  describe('alMenosUnaHabilidadValidator', () => {
    it('debe permitir si hay al menos una habilidad', () => {
      const validator = alMenosUnaHabilidadValidator();
      expect(validator(new FormControl(['Angular']))).toBeNull();
    });

    it('debe rechazar si el arreglo está vacío', () => {
      const validator = alMenosUnaHabilidadValidator();
      expect(validator(new FormControl([]))).toEqual({ sinHabilidades: true });
    });
  });
});
