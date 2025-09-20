import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generic-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div *ngIf="isValidChartData; else noData">
      <apx-chart
        [series]="chartOptions.series"
        [chart]="chartOptions.chart"
        [xaxis]="chartOptions.xaxis"
        [yaxis]="chartOptions.yaxis"
        [title]="chartOptions.title"
        [stroke]="chartOptions.stroke"
        [fill]="chartOptions.fill"
        [colors]="chartOptions.colors"
        [markers]="chartOptions.markers"
        [theme]="chartOptions.theme"
        [tooltip]="chartOptions.tooltip"
        [grid]="chartOptions.grid"
        [dataLabels]="chartOptions.dataLabels"
        [legend]="chartOptions.legend"
        [labels]="chartOptions.labels"
        [noData]="chartOptions.noData"
      ></apx-chart>
    </div>
    <ng-template #noData>
      <p>No data available for the chart.</p>
    </ng-template>
  `,
  styleUrls: ['./generic-chart.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GenericChartComponent implements OnChanges {
  @Input() chartData: any[] = [];
  @Input() chartCategories: string[] = [];

  @Input() chartType: 'line' | 'bar' | 'area' | 'pie' | 'doughnut' = 'line';
  @Input() chartHeight: number = 350;
  @Input() chartTitle: string = 'Data Visualization';
  @Input() yAxisTitle: string = 'Values';
  @Input() seriesName: string = 'Series';
  @Input() color: string = '#4a6cf7';
  @Input() showToolbar: boolean = true;
  @Input() strokeCurve: 'smooth' | 'straight' | 'stepline' = 'smooth';
  @Input() showLegend: boolean = true;
  @Input() footerStats?: { value: string; label: string }[];

  public chartOptions: any;
  public isValidChartData: boolean = false;

  constructor() {
    this.updateChartOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.hasChartChanges(changes)) {
      this.updateChartOptions();
      console.log('********************************* Chart data:', this.chartData, 'Categories:', this.chartCategories);
    }
  }

  private hasChartChanges(changes: SimpleChanges): boolean {
    return !!(
      changes['chartData'] ||
      changes['chartCategories'] ||
      changes['chartType'] ||
      changes['chartHeight'] ||
      changes['chartTitle'] ||
      changes['yAxisTitle'] ||
      changes['seriesName'] ||
      changes['color'] ||
      changes['showToolbar'] ||
      changes['strokeCurve']
    );
  }

  private updateChartOptions(): void {
    const safeChartData = this.getSafeChartData();
    const safeChartCategories = this.getSafeChartCategories();

    this.isValidChartData =
      safeChartData.length > 0 &&
      safeChartCategories.length > 0 &&
      safeChartData.length === safeChartCategories.length;

    const series =
      this.chartType === 'pie' || this.chartType === 'doughnut'
        ? safeChartData
        : [
            {
              name: this.seriesName,
              data: safeChartData
            }
          ];

    // 🎨 couleurs différentes pour chaque catégorie dans pie/doughnut
    const colors =
      this.chartType === 'pie' || this.chartType === 'doughnut'
        ? this.generateCategoryColors(safeChartCategories.length)
        : [this.color];

    this.chartOptions = {
      series,
      chart: {
        type: this.chartType === 'doughnut' ? 'donut' : this.chartType,
        height: this.chartHeight,
        background: '#ffffff',
        foreColor: '#2d3748',
        toolbar: {
          show: this.showToolbar,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          },
          autoSelected: 'zoom'
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      stroke: {
        width: this.chartType === 'pie' || this.chartType === 'doughnut' ? 0 : 4,
        curve: this.strokeCurve,
        colors
      },
      xaxis:
        this.chartType === 'pie' || this.chartType === 'doughnut'
          ? undefined
          : {
              categories: safeChartCategories,
              labels: {
                style: {
                  colors: '#4a5568',
                  fontFamily: 'Inter, sans-serif'
                }
              },
              axisBorder: {
                show: true,
                color: '#e2e8f0'
              },
              axisTicks: {
                color: '#e2e8f0'
              }
            },
      yaxis:
        this.chartType === 'pie' || this.chartType === 'doughnut'
          ? undefined
          : {
              title: {
                text: this.yAxisTitle,
                style: {
                  color: '#4a5568',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600
                }
              },
              labels: {
                style: {
                  colors: '#4a5568',
                  fontFamily: 'Inter, sans-serif'
                }
              },
              min: 0,
              forceNiceScale: true
            },
      fill: {
        type: this.chartType === 'pie' || this.chartType === 'doughnut' ? 'solid' : 'gradient',
        gradient: {
          shade: 'light',
          gradientToColors: [this.adjustColor(this.color, 20)],
          shadeIntensity: 0.5,
          type: 'vertical',
          opacityFrom: 0.8,
          opacityTo: 0.2,
          stops: [0, 100]
        }
      },
      colors,
      markers: {
        size: this.chartType === 'pie' || this.chartType === 'doughnut' ? 0 : 6,
        colors: ['#ffffff'],
        strokeColors: this.color,
        strokeWidth: 2,
        hover: {
          size: 8
        }
      },
      title: {
        text: this.chartTitle,
        align: 'left',
        style: {
          color: '#1a1a1a',
          fontSize: '20px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600
        },
        margin: 20
      },
      theme: {
        mode: 'light'
      },
      tooltip: {
        theme: 'light',
        style: {
          fontFamily: 'Inter, sans-serif'
        },
        marker: {
          show: true
        }
      },
      grid: {
        borderColor: '#e2e8f0',
        strokeDashArray: 4,
        padding: {
          top: 20,
          right: 20,
          bottom: 0,
          left: 20
        }
      },
      dataLabels: {
        enabled: this.chartType === 'pie' || this.chartType === 'doughnut'
      },
      legend: {
        show: this.showLegend,
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        markers: {
          width: 12,
          height: 12,
          radius: 6
        }
      },
      labels: this.chartType === 'pie' || this.chartType === 'doughnut' ? safeChartCategories : undefined,
      noData: {
        text: 'No data available',
        align: 'center',
        verticalAlign: 'middle',
        style: {
          color: '#6b7280',
          fontSize: '16px',
          fontFamily: 'Inter, sans-serif'
        }
      }
    };
  }

  private getSafeChartData(): number[] {
    if (!this.chartData || !Array.isArray(this.chartData) || this.chartData.length === 0) {
      console.warn('Invalid chartData provided, using default empty array');
      return [0];
    }
    const filteredData = this.chartData
      .filter(item => item !== null && item !== undefined)
      .map(item => {
        const num = Number(item);
        return isNaN(num) ? 0 : num;
      });
    return filteredData.length > 0 ? filteredData : [0];
  }

  private getSafeChartCategories(): string[] {
    if (!this.chartCategories || !Array.isArray(this.chartCategories) || this.chartCategories.length === 0) {
      console.warn('Invalid chartCategories provided, using default categories');
      return ['Default'];
    }
    const filteredCategories = this.chartCategories
      .filter(cat => cat !== null && cat !== undefined)
      .map(cat => String(cat));
    const safeData = this.getSafeChartData();
    if (filteredCategories.length !== safeData.length) {
      console.warn('Categories length does not match data length, adjusting categories');
      if (filteredCategories.length > safeData.length) {
        return filteredCategories.slice(0, safeData.length);
      } else {
        const extendedCategories = [...filteredCategories];
        for (let i = filteredCategories.length; i < safeData.length; i++) {
          extendedCategories.push(`Category ${i + 1}`);
        }
        return extendedCategories;
      }
    }
    return filteredCategories;
  }

  private adjustColor(color: string, amount: number): string {
    return color;
  }

  private generateCategoryColors(count: number): string[] {
    const palette = [
      '#4a6cf7', '#f76c6c', '#6cf7a6', '#f7d36c',
      '#a66cf7', '#6cccf7', '#f76ccd', '#6cf79b'
    ];
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(palette[i % palette.length]);
    }
    return colors;
  }
}
