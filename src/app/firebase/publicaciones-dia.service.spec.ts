import { TestBed } from '@angular/core/testing';

import { PublicacionesDiaService } from './publicaciones-dia.service';

describe('PublicacionesDiaService', () => {
  let service: PublicacionesDiaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicacionesDiaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
