import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { ChartComponent } from "ng-apexcharts";

@Component({
  selector: 'app-bar-growth-chart',
  templateUrl: './bar-growth-chart.component.html',
  styleUrls: ['./bar-growth-chart.component.css'],
  imports: [ChartComponent,CommonModule]
})
export class BarGrowthChartComponent implements OnChanges, OnInit {
  
  @Input() data: number[] = [];
  @Input() categories: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  @Input() chartTitle: string = 'Monthly Company trend';

  isLoading: boolean = false;
  errorMessage: string = '';

  chartOptions: any = {};

  ngOnInit() {
    this.updateChartOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['categories'] || changes['chartTitle']) {
      this.updateChartOptions();
    }
  }

  updateChartOptions() {
    this.chartOptions = {
      series: [
        {
          name: 'Job Postings',
          data: this.data || []
        }
      ],
      chart: {
        type: 'bar',
        height: 350,
        background: '#ffffff',
        foreColor: '#2d3748',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          horizontal: false,
          columnWidth: '65%',
          distributed: false,
          dataLabels: {
            position: 'top'
          }
        }
      },
      colors: ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val > 0 ? val : '',
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#4b5563'],
          fontFamily: 'Inter, sans-serif'
        }
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: this.categories,
        labels: {
          style: {
            colors: '#4b5563',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500
          }
        },
        axisBorder: {
          show: true,
          color: '#e5e7eb'
        },
        axisTicks: {
          show: true,
          color: '#e5e7eb'
        },
        tooltip: {
          enabled: false
        }
      },
      yaxis: {
        title: {
          text: 'Number of Companies',
          style: {
            color: '#4b5563',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600
          }
        },
        labels: {
          style: {
            colors: '#4b5563',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          }
        },
        min: 0,
        forceNiceScale: true,
        axisBorder: {
          show: true,
          color: '#e5e7eb'
        },
        axisTicks: {
          show: true,
          color: '#e5e7eb'
        }
      },
      fill: {
        opacity: 1,
        type: 'solid'
      },
      title: {
        text: this.chartTitle,
        align: 'left',
        margin: 20,
        style: {
          color: '#111827',
          fontSize: '18px',
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
        y: {
          formatter: (val: number) => val + (val === 1 ? ' posting' : ' postings')
        }
      },
      grid: {
        borderColor: '#f3f4f6',
        strokeDashArray: 4,
        padding: {
          top: 20,
          right: 20,
          bottom: 0,
          left: 20
        },
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '75%'
              }
            },
            chart: {
              height: 300
            },
            dataLabels: {
              enabled: false
            }
          }
        }
      ]
    };
  }

  retryLoadData() {
    this.isLoading = true;
    this.errorMessage = '';

    // Simulate data reload (replace with actual service call)
    setTimeout(() => {
      this.isLoading = false;

      // Example: Update data, or set error
      // this.errorMessage = 'Failed to load data';
      this.updateChartOptions();

    }, 1500);
  }
}
