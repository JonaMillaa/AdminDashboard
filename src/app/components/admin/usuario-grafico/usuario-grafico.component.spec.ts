import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioGraficoComponent } from './usuario-grafico.component';

describe('UsuarioGraficoComponent', () => {
  let component: UsuarioGraficoComponent;
  let fixture: ComponentFixture<UsuarioGraficoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioGraficoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuarioGraficoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
