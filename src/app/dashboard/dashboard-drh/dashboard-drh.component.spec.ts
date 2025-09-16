import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDrhComponent } from './dashboard-drh.component';

describe('DashboardDrhComponent', () => {
  let component: DashboardDrhComponent;
  let fixture: ComponentFixture<DashboardDrhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardDrhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardDrhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
