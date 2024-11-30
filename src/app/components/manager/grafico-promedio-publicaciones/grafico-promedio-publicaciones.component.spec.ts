import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoPromedioPublicacionesComponent } from './grafico-promedio-publicaciones.component';

describe('GraficoPromedioPublicacionesComponent', () => {
  let component: GraficoPromedioPublicacionesComponent;
  let fixture: ComponentFixture<GraficoPromedioPublicacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoPromedioPublicacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoPromedioPublicacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
