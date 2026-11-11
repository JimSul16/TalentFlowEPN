import { TestBed } from '@angular/core/testing';

import { CandidatosService } from './candidatos.service';

describe('CandidatosService', () => {
  let service: CandidatosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CandidatosService);
  });

  it('debe crearse correctamente el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe traducir error de permisos denegados', () => {
    const errorSimulado = { code: 'permission-denied' };
    const mensaje = (service as any).traducirError(errorSimulado);
    expect(mensaje).toContain('Acceso denegado');
  });

  it('debe traducir error de conexión no disponible', () => {
    const errorSimulado = { code: 'unavailable' };
    const mensaje = (service as any).traducirError(errorSimulado);
    expect(mensaje).toContain('no está disponible');
  });

  it('debe traducir error de registro no encontrado', () => {
    const errorSimulado = { code: 'not-found' };
    const mensaje = (service as any).traducirError(errorSimulado);
    expect(mensaje).toContain('No se encontró');
  });

  it('debe traducir errores desconocidos a mensaje genérico seguro', () => {
    const errorSimulado = { message: 'internal secret info' };
    const mensaje = (service as any).traducirError(errorSimulado);
    expect(mensaje).toContain('Ocurrió un error');
    expect(mensaje).not.toContain('internal secret info');
  });
});
