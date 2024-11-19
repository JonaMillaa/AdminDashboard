import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarPublicacionComponent } from './modificar-publicacion.component';

describe('ModificarPublicacionComponent', () => {
  let component: ModificarPublicacionComponent;
  let fixture: ComponentFixture<ModificarPublicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarPublicacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarPublicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
