import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicacionesMesDashboardComponent } from './publicaciones-mes-dashboard.component';

describe('PublicacionesMesDashboardComponent', () => {
  let component: PublicacionesMesDashboardComponent;
  let fixture: ComponentFixture<PublicacionesMesDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicacionesMesDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicacionesMesDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
