import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesPublicacionesDiaComponent } from './reportes-publicaciones-dia.component';

describe('ReportesPublicacionesDiaComponent', () => {
  let component: ReportesPublicacionesDiaComponent;
  let fixture: ComponentFixture<ReportesPublicacionesDiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesPublicacionesDiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesPublicacionesDiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
