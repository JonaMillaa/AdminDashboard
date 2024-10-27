import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDetallesDiaComponent } from './modal-detalles-dia.component';

describe('ModalDetallesDiaComponent', () => {
  let component: ModalDetallesDiaComponent;
  let fixture: ComponentFixture<ModalDetallesDiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalDetallesDiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDetallesDiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
