import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoporteGestionComponent } from './soporte-gestion.component';

describe('SoporteGestionComponent', () => {
  let component: SoporteGestionComponent;
  let fixture: ComponentFixture<SoporteGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoporteGestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoporteGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
