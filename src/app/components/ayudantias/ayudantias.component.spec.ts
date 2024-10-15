import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AyudantiasComponent } from './ayudantias.component';

describe('AyudantiasComponent', () => {
  let component: AyudantiasComponent;
  let fixture: ComponentFixture<AyudantiasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AyudantiasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AyudantiasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
