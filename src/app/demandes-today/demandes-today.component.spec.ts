import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesTodayComponent } from './demandes-today.component';

describe('DemandesTodayComponent', () => {
  let component: DemandesTodayComponent;
  let fixture: ComponentFixture<DemandesTodayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandesTodayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandesTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
