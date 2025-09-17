import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarGrowthChartComponent } from './bar-growth-chart.component';

describe('BarGrowthChartComponent', () => {
  let component: BarGrowthChartComponent;
  let fixture: ComponentFixture<BarGrowthChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarGrowthChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarGrowthChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
