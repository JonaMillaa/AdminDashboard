import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosDelDiaComponent } from './datos-del-dia.component';

describe('DatosDelDiaComponent', () => {
  let component: DatosDelDiaComponent;
  let fixture: ComponentFixture<DatosDelDiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosDelDiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatosDelDiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
