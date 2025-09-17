// growth-chart.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generic-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './generic-chart.component.html',
  styleUrls: ['./generic-chart.component.css']
})
export class GenericChartComponent implements OnChanges {
  // Required Inputs
  @Input() chartData: any[] = [];
  @Input() chartCategories: string[] = [];
  
  // Optional Customization Inputs
  @Input() chartType: 'line' | 'bar' | 'area' | 'pie' = 'line';
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

  constructor() {
    this.updateChartOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] || changes['chartCategories'] || 
        changes['chartType'] || changes['chartHeight'] || 
        changes['chartTitle'] || changes['yAxisTitle'] || 
        changes['seriesName'] || changes['color'] || 
        changes['showToolbar'] || changes['strokeCurve']) {
      this.updateChartOptions();
      console.log(this.chartData)
    }
  }

  private updateChartOptions(): void {
    this.chartOptions = {
      series: [{
        name: this.seriesName,
        data: this.chartData
      }],
      chart: {
        type: this.chartType,
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
        }
      },
      stroke: {
        width: 4,
        curve: this.strokeCurve,
        colors: [this.color]
      },
      xaxis: {
        categories: this.chartCategories,
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
      yaxis: {
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
        type: 'gradient',
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
      colors: [this.color],
      markers: {
        size: 6,
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
        }
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
        enabled: false
      },
      legend: {
        show: this.showLegend,
        position: 'top'
      }
    };
  }

  private adjustColor(color: string, amount: number): string {
    // Simple color adjustment for gradient
    return color; // Implement proper color adjustment if needed
  }
}