import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoporteRespuestaComponent } from './soporte-respuesta.component';

describe('SoporteRespuestaComponent', () => {
  let component: SoporteRespuestaComponent;
  let fixture: ComponentFixture<SoporteRespuestaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoporteRespuestaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoporteRespuestaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
