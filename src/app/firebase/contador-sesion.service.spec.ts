import { TestBed } from '@angular/core/testing';

import { ContadorSesionService } from './contador-sesion.service';

describe('ContadorSesionService', () => {
  let service: ContadorSesionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContadorSesionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
