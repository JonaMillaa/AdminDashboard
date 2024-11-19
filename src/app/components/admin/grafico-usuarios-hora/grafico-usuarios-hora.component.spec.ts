import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoUsuariosHoraComponent } from './grafico-usuarios-hora.component';

describe('GraficoUsuariosHoraComponent', () => {
  let component: GraficoUsuariosHoraComponent;
  let fixture: ComponentFixture<GraficoUsuariosHoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoUsuariosHoraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoUsuariosHoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
