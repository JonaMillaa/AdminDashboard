import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntervencionPagosComponent } from './intervencion-pagos.component';

describe('IntervencionPagosComponent', () => {
  let component: IntervencionPagosComponent;
  let fixture: ComponentFixture<IntervencionPagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntervencionPagosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntervencionPagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
