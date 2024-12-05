import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicacionesTableComponent } from './publicaciones-table.component';

describe('PublicacionesTableComponent', () => {
  let component: PublicacionesTableComponent;
  let fixture: ComponentFixture<PublicacionesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicacionesTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicacionesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
