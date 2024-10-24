import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTasaComponent } from './modal-tasa.component';

describe('ModalTasaComponent', () => {
  let component: ModalTasaComponent;
  let fixture: ComponentFixture<ModalTasaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalTasaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalTasaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
