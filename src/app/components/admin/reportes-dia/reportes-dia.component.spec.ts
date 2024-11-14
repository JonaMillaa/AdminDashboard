import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesDiaComponent } from './reportes-dia.component';

describe('ReportesDiaComponent', () => {
  let component: ReportesDiaComponent;
  let fixture: ComponentFixture<ReportesDiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesDiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesDiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
