import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNoDataComponent } from './modal-no-data.component';

describe('ModalNoDataComponent', () => {
  let component: ModalNoDataComponent;
  let fixture: ComponentFixture<ModalNoDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNoDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNoDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
