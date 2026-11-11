import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

import type { Candidato } from '../../core/models/candidato.model';
import { CandidatosService } from '../../services/candidatos.service';

import { CandidatosPage } from './candidatos.page';

describe('CandidatosPage', () => {
  let component: CandidatosPage;
  let fixture: ComponentFixture<CandidatosPage>;
  let mockCandidatosService: {
    crear: ReturnType<typeof vi.fn>;
    listar: ReturnType<typeof vi.fn>;
  };
  let mockModalCtrl: {
    create: ReturnType<typeof vi.fn>;
  };

  const mockCandidatos: Candidato[] = [
    {
      id: '1',
      nombres: 'Ana Pérez',
      correo: 'ana@ejemplo.test',
      telefono: '0990000000',
      fechaNacimiento: '2000-04-15',
      cargo: 'Desarrollador móvil',
      nivelAcademico: 'Tercer nivel',
      experienciaAnios: 3,
      modalidad: 'Híbrida',
      habilidades: ['Ionic', 'Angular', 'Git'],
      fechaDisponibilidad: '2026-12-01',
      aspiracionSalarial: 1200,
      resumen: 'Desarrolladora de aplicaciones móviles con experiencia en interfaces.',
      consentimiento: true,
    },
  ];

  beforeEach(async () => {
    mockCandidatosService = {
      crear: vi.fn(),
      listar: vi.fn().mockResolvedValue(mockCandidatos),
    };

    mockModalCtrl = {
      create: vi.fn().mockResolvedValue({
        present: vi.fn(),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [CandidatosPage],
      providers: [
        { provide: CandidatosService, useValue: mockCandidatosService },
        { provide: ModalController, useValue: mockModalCtrl },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CandidatosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente de listado de candidatos', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar la lista de candidatos al inicializarse', async () => {
    await component.cargarCandidatos();
    expect(component.candidatos().length).toBe(1);
    expect(component.candidatos()[0].nombres).toBe('Ana Pérez');
  });
});
