import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { CandidatosService } from '../../services/candidatos.service';

import { RegistroPage } from './registro.page';

describe('RegistroPage', () => {
  let component: RegistroPage;
  let fixture: ComponentFixture<RegistroPage>;
  let mockCandidatosService: {
    crear: ReturnType<typeof vi.fn>;
    listar: ReturnType<typeof vi.fn>;
  };
  let mockRouter: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockCandidatosService = {
      crear: vi.fn().mockResolvedValue('test-id-123'),
      listar: vi.fn().mockResolvedValue([]),
    };
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [RegistroPage],
      providers: [
        { provide: CandidatosService, useValue: mockCandidatosService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente de registro', () => {
    expect(component).toBeTruthy();
  });

  it('el formulario debe ser inválido al inicializarse vacío', () => {
    expect(component.candidatoForm.valid).toBe(false);
  });

  it('no debe llamar a crear() si el formulario es inválido', async () => {
    await component.onSubmit();
    expect(mockCandidatosService.crear).not.toHaveBeenCalled();
  });

  it('debe validar correctamente un candidato completo', () => {
    component.candidatoForm.patchValue({
      nombres: 'Carlos Mendoza',
      correo: 'carlos@ejemplo.test',
      telefono: '0987654321',
      fechaNacimiento: '1995-05-20',
      cargo: 'Desarrollador móvil',
      nivelAcademico: 'Tercer nivel',
      experienciaAnios: 4,
      modalidad: 'Híbrida',
      habilidades: ['Ionic', 'Angular', 'Firebase'],
      fechaDisponibilidad: '2026-12-01',
      aspiracionSalarial: 1500,
      resumen: 'Profesional con más de 4 años de experiencia en desarrollo de aplicaciones híbridas y nativas.',
      consentimiento: true,
    });

    expect(component.candidatoForm.valid).toBe(true);
  });

  it('debe enviar el formulario y navegar a /tabs/candidatos en éxito', async () => {
    component.candidatoForm.patchValue({
      nombres: 'Carlos Mendoza',
      correo: 'carlos@ejemplo.test',
      telefono: '0987654321',
      fechaNacimiento: '1995-05-20',
      cargo: 'Desarrollador móvil',
      nivelAcademico: 'Tercer nivel',
      experienciaAnios: 4,
      modalidad: 'Híbrida',
      habilidades: ['Ionic', 'Angular', 'Firebase'],
      fechaDisponibilidad: '2026-12-01',
      aspiracionSalarial: 1500,
      resumen: 'Profesional con más de 4 años de experiencia en desarrollo de aplicaciones híbridas y nativas.',
      consentimiento: true,
    });

    await component.onSubmit();
    expect(mockCandidatosService.crear).toHaveBeenCalledTimes(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs/candidatos']);
  });
});
