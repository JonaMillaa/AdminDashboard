import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosPendientesComponent } from './pagos-pendientes.component';

describe('PagosPendientesComponent', () => {
  let component: PagosPendientesComponent;
  let fixture: ComponentFixture<PagosPendientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagosPendientesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagosPendientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
