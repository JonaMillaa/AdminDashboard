import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoporteModuloComponent } from './soporte-modulo.component';

describe('SoporteModuloComponent', () => {
  let component: SoporteModuloComponent;
  let fixture: ComponentFixture<SoporteModuloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoporteModuloComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoporteModuloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
