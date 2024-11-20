import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicacionesPorEstadoComponent } from './publicaciones-por-estado.component';

describe('PublicacionesPorEstadoComponent', () => {
  let component: PublicacionesPorEstadoComponent;
  let fixture: ComponentFixture<PublicacionesPorEstadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicacionesPorEstadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicacionesPorEstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
