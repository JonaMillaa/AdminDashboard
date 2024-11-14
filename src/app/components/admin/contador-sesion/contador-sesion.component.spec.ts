import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContadorSesionComponent } from './contador-sesion.component';

describe('ContadorSesionComponent', () => {
  let component: ContadorSesionComponent;
  let fixture: ComponentFixture<ContadorSesionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContadorSesionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContadorSesionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
