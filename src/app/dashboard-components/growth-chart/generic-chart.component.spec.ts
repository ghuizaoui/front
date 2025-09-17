import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrowthChartComponent } from './generic-chart.component';

describe('GrowthChartComponent', () => {
  let component: GrowthChartComponent;
  let fixture: ComponentFixture<GrowthChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrowthChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrowthChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
