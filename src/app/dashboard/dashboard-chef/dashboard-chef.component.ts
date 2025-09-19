// dashboard-drh.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemandeService } from '../../services/demande/demande.service';
import { forkJoin } from 'rxjs';
import { Kpi } from '../../models/kpi';
import { KpiCardsComponent } from "../../dashboard-components/kpi-cards/kpi-cards.component";
import { WelcomeCardComponent } from "../../dashboard-components/welcome-card/welcome-card.component";
import { GenericChartComponent } from "../../dashboard-components/growth-chart/generic-chart.component";

@Component({
  selector: 'app-dashboard-chef',
  standalone: true,
  imports: [CommonModule, KpiCardsComponent, WelcomeCardComponent, GenericChartComponent],
  templateUrl: './dashboard-chef.component.html',
  styleUrls: ['./dashboard-chef.component.css']
})
export class DashboardChefComponent implements OnInit {
  kpis: Kpi[] = [];
  errorMessage: string | null = null; 
  isLoading: boolean = true;

  // Multiple chart data
  monthlyChartData: number[] = [];
  monthlyChartCategories: string[] = [];
  
  categoryMonthlyChartData: number[] = [];
  categoryMonthlyChartCategories: string[] = [];
  
  typeChartData: number[] = [];
  typeChartCategories: string[] = [];
  
  monthYearChartData: number[] = [];
  monthYearChartCategories: string[] = [];

  // Chart type toggles
  showMonthlyChart: boolean = true;
  showCategoryChart: boolean = false;
  showTypeChart: boolean = false;
  showMonthYearChart: boolean = false;

  // Current active chart
  activeChart: string = 'monthly';

  constructor(private demandeService: DemandeService) {}

  ngOnInit(): void {
    this.loadKpis();
    this.loadAllCharts();
  }

  private loadKpis(): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      byCategorie: this.demandeService.getCountByCategorie(),
      byEmploye: this.demandeService.getCountByEmploye(),
      byService: this.demandeService.getCountByService(),
    }).subscribe({
      next: (results: any) => {
        this.kpis = [
          {
            title: 'Demandes par Catégorie',
            value: Array.isArray(results.byCategorie) ? 
                   results.byCategorie.reduce((acc: number, item: any) => acc + (item[1] || 0), 0) : 0,
          },
          {
            title: 'Demandes par Employé',
            value: Array.isArray(results.byEmploye) ? 
                   results.byEmploye.reduce((acc: number, item: any) => acc + (item[1] || 0), 0) : 0,
          },
          {
            title: 'Demandes par Service',
            value: Array.isArray(results.byService) ? 
                   results.byService.reduce((acc: number, item: any) => acc + (item[1] || 0), 0) : 0,
          },
        ];

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des KPI', err);
        this.errorMessage = 'Impossible de charger les indicateurs.';
        this.isLoading = false;
      }
    });
  }

  private loadAllCharts(): void {
    const start = '2025-01-01T00:00:00';
    const end = '2025-12-31T23:59:59';

    // Load monthly chart
    this.demandeService.countDemandesPerMonth(start, end).subscribe({
      next: (result: any) => {
        if (Array.isArray(result)) {
          this.monthlyChartCategories = result.map((r: any) => r[0] || '');
          this.monthlyChartData = result.map((r: any) => r[1] || 0);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement du chart mensuel', err);
        this.setDefaultChartData('monthly');
      }
    });

    // Load category monthly chart
    this.demandeService.countDemandesByCategoriePerMonth(start, end).subscribe({
      next: (result: any) => {
        if (Array.isArray(result)) {
          this.categoryMonthlyChartCategories = result.map((r: any) => r[0] || '');
          this.categoryMonthlyChartData = result.map((r: any) => r[1] || 0);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement du chart par catégorie', err);
        this.setDefaultChartData('category');
      }
    });

    // Load type chart
    this.demandeService.countDemandesByType().subscribe({
      next: (result: any) => {
        if (Array.isArray(result)) {
          this.typeChartCategories = result.map((r: any) => r[0] || '');
          this.typeChartData = result.map((r: any) => r[1] || 0);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement du chart par type', err);
        this.setDefaultChartData('type');
      }
    });

    // Load month-year chart
    this.demandeService.countDemandesPerMonthAndYear().subscribe({
      next: (result: any) => {
        if (Array.isArray(result)) {
          this.monthYearChartCategories = result.map((r: any) => r[0] || '');
          this.monthYearChartData = result.map((r: any) => r[1] || 0);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement du chart mois-année', err);
        this.setDefaultChartData('monthYear');
      }
    });
  }

  private setDefaultChartData(chartType: string): void {
    const defaultCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const defaultData = [5, 8, 12, 7, 9, 15];

    switch(chartType) {
      case 'monthly':
        this.monthlyChartCategories = defaultCategories;
        this.monthlyChartData = defaultData;
        break;
      case 'category':
        this.categoryMonthlyChartCategories = defaultCategories;
        this.categoryMonthlyChartData = defaultData;
        break;
      case 'type':
        this.typeChartCategories = ['Type A', 'Type B', 'Type C'];
        this.typeChartData = [20, 35, 45];
        break;
      case 'monthYear':
        this.monthYearChartCategories = defaultCategories;
        this.monthYearChartData = defaultData;
        break;
    }
  }

  // Chart switching methods
  showChart(chartType: string): void {
    this.activeChart = chartType;
    this.showMonthlyChart = chartType === 'monthly';
    this.showCategoryChart = chartType === 'category';
    this.showTypeChart = chartType === 'type';
    this.showMonthYearChart = chartType === 'monthYear';
  }

  // Get current chart data based on active chart
  getCurrentChartData(): number[] {
    switch(this.activeChart) {
      case 'monthly': return this.monthlyChartData;
      case 'category': return this.categoryMonthlyChartData;
      case 'type': return this.typeChartData;
      case 'monthYear': return this.monthYearChartData;
      default: return this.monthlyChartData;
    }
  }

  getCurrentChartCategories(): string[] {
    switch(this.activeChart) {
      case 'monthly': return this.monthlyChartCategories;
      case 'category': return this.categoryMonthlyChartCategories;
      case 'type': return this.typeChartCategories;
      case 'monthYear': return this.monthYearChartCategories;
      default: return this.monthlyChartCategories;
    }
  }

  getCurrentChartTitle(): string {
    switch(this.activeChart) {
      case 'monthly': return 'Demandes par Mois';
      case 'category': return 'Demandes par Catégorie (Mensuel)';
      case 'type': return 'Répartition par Type de Demande';
      case 'monthYear': return 'Demandes par Mois et Année';
      default: return 'Demandes par Mois';
    }
  }

  getCurrentChartType(): 'line' | 'bar' | 'area' | 'pie' {
    switch(this.activeChart) {
      case 'type': return 'pie';
      default: return 'line';
    }
  }

  getCurrentSeriesName(): string {
    switch(this.activeChart) {
      case 'monthly': return 'Nombre de Demandes';
      case 'category': return 'Demandes par Catégorie';
      case 'type': return 'Répartition';
      case 'monthYear': return 'Demandes par Période';
      default: return 'Nombre de Demandes';
    }
  }

  getCurrentColor(): string {
    switch(this.activeChart) {
      case 'monthly': return '#4a6cf7';
      case 'category': return '#10b981';
      case 'type': return '#f59e0b';
      case 'monthYear': return '#ef4444';
      default: return '#4a6cf7';
    }
  }

}