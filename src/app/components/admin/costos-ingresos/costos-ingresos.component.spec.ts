import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostosIngresosComponent } from './costos-ingresos.component';

describe('CostosIngresosComponent', () => {
  let component: CostosIngresosComponent;
  let fixture: ComponentFixture<CostosIngresosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostosIngresosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostosIngresosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
