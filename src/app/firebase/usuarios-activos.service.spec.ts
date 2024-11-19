import { TestBed } from '@angular/core/testing';

import { UsuariosActivosService } from './usuarios-activos.service';

describe('UsuariosActivosService', () => {
  let service: UsuariosActivosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuariosActivosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
