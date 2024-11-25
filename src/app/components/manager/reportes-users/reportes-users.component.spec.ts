import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesUsersComponent } from './reportes-users.component';

describe('ReportesUsersComponent', () => {
  let component: ReportesUsersComponent;
  let fixture: ComponentFixture<ReportesUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
