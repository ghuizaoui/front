// generic-chart.component.ts
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
  // Required Inputs with proper initialization
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
    // Initialize with safe defaults
    this.updateChartOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.hasChartChanges(changes)) {
      this.updateChartOptions();
      console.log("this is the data in the chart "+this.chartData)
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
    // Ensure we have valid data arrays
    const safeChartData = this.getSafeChartData();
    const safeChartCategories = this.getSafeChartCategories();

    this.chartOptions = {
      series: [{
        name: this.seriesName,
        data: safeChartData
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
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      stroke: {
        width: 4,
        curve: this.strokeCurve,
        colors: [this.color]
      },
      xaxis: {
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
        enabled: false
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

    // Special handling for pie charts
    if (this.chartType === 'pie') {
      this.chartOptions.labels = safeChartCategories;
      delete this.chartOptions.xaxis;
      delete this.chartOptions.yaxis;
    }
  }

  private getSafeChartData(): any[] {
    // Ensure we always have a valid array
    if (!this.chartData || !Array.isArray(this.chartData)) {
      console.warn('Invalid chartData provided, using default empty array');
      return [0]; // Return at least one value to prevent the null length error
    }

    // Filter out null/undefined values and ensure numbers
    const filteredData = this.chartData
      .filter(item => item !== null && item !== undefined)
      .map(item => {
        const num = Number(item);
        return isNaN(num) ? 0 : num;
      });

    // If we end up with empty array, provide default data
    return filteredData.length > 0 ? filteredData : [0];
  }

  private getSafeChartCategories(): string[] {
    // Ensure we always have valid categories
    if (!this.chartCategories || !Array.isArray(this.chartCategories)) {
      console.warn('Invalid chartCategories provided, using default categories');
      return ['Default'];
    }

    // Filter out null/undefined values and ensure strings
    const filteredCategories = this.chartCategories
      .filter(cat => cat !== null && cat !== undefined)
      .map(cat => String(cat));

    // If we end up with empty array, provide default categories
    if (filteredCategories.length === 0) {
      return ['Category 1', 'Category 2', 'Category 3'];
    }

    // Ensure categories match data length
    const safeData = this.getSafeChartData();
    if (filteredCategories.length !== safeData.length) {
      console.warn('Categories length does not match data length, adjusting categories');
      
      // If we have more categories than data, truncate
      if (filteredCategories.length > safeData.length) {
        return filteredCategories.slice(0, safeData.length);
      }
      // If we have more data than categories, extend with default names
      else {
        const extendedCategories = [...filteredCategories];
        for (let i = filteredCategories.length; i < safeData.length; i++) {
          extendedCategories.push(`Item ${i + 1}`);
        }
        return extendedCategories;
      }
    }

    return filteredCategories;
  }

  private adjustColor(color: string, amount: number): string {
    // Simple color lightening for gradient effect
    // This is a basic implementation - you might want to use a proper color library
    return color; // Return the original color for now
  }
}