import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeCardComponent } from "../../dashboard-components/welcome-card/welcome-card.component";
import { DashboardEmployeService, EmployeDashboardDTO, KPIData, DemandeRecente, AutorisationAujourdhui } from '../../services/dashboard-employe/dashboard-employe.service';
import { AuthService } from '../../services/auth/auth.service';
import { KpiCardsComponent } from "../../dashboard-components/kpi-cards/kpi-cards.component";
import { GenericChartComponent } from "../../dashboard-components/growth-chart/generic-chart.component";
import { Kpi } from '../../models/kpi';
import { WelcomeCardEmployeComponent } from "../welcome-card-employe/welcome-card-employe.component";

// Extended interface to match your backend response
interface ExtendedKPIData {
  totalDemandes: number;
  demandesEnCours: number;
  demandesValidees: number;
  demandesRefusees: number;
  autorisationsAujourdhui?: number;
}

@Component({
  selector: 'app-dashboard-employe',
  standalone: true,
  imports: [CommonModule, WelcomeCardComponent, KpiCardsComponent, GenericChartComponent, WelcomeCardEmployeComponent],
  templateUrl: './dashboard-employe.component.html',
  styleUrls: ['./dashboard-employe.component.css']
})
export class DashboardEmployeComponent implements OnInit {
  dashboardData: EmployeDashboardDTO | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  userRole: string = '';
  userMatricule: string = '';
  
  // Chart data
  statutChartData: number[] = [];
  statutChartCategories: string[] = [];
  categorieChartData: number[] = [];
  categorieChartCategories: string[] = [];
  
  // KPI data
  kpis: Kpi[] = [];

  constructor(
    private dashboardEmploye: DashboardEmployeService,
    private authService: AuthService
  ) {
  
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    console.log("////////////////////////////////////////////// Matricule: " + this.userMatricule, this.userRole);
    
    this.dashboardEmploye.getDashboard().subscribe({
      next: (data: EmployeDashboardDTO) => {
        console.log("Dashboard data received: ", data);
        if (!data || !data.statutDistribution || !data.categorieDistribution) {
          console.error('Invalid dashboard data:', data);
          this.errorMessage = 'Données du dashboard invalides ou incomplètes.';
          this.isLoading = false;
          return;
        }
        this.dashboardData = data;
        this.prepareChartData();
        this.prepareKpiData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.errorMessage = 'Impossible de charger les données du dashboard.';
        this.isLoading = false;
      }
    });
  }

  private prepareChartData(): void {
    if (!this.dashboardData) {
      console.warn('No dashboard data available');
      this.statutChartData = [];
      this.statutChartCategories = [];
      this.categorieChartData = [];
      this.categorieChartCategories = [];
      return;
    }

    // Prepare status distribution chart
    if (this.dashboardData.statutDistribution && typeof this.dashboardData.statutDistribution === 'object') {
      this.statutChartCategories = Object.keys(this.dashboardData.statutDistribution || {});
      this.statutChartData = Object.values(this.dashboardData.statutDistribution || {});
    } else {
      console.warn('Invalid statutDistribution:', this.dashboardData.statutDistribution);
      this.statutChartCategories = [];
      this.statutChartData = [];
    }

    // Prepare category distribution chart
    if (this.dashboardData.categorieDistribution && typeof this.dashboardData.categorieDistribution === 'object') {
      this.categorieChartCategories = Object.keys(this.dashboardData.categorieDistribution);
      this.categorieChartData = Object.values(this.dashboardData.categorieDistribution).map(val => Number(val) || 0);
    } else {
      console.warn('Invalid categorieDistribution:', this.dashboardData.categorieDistribution);
      this.categorieChartCategories = [];
      this.categorieChartData = [];
    }
  }

  private prepareKpiData(): void {
    if (!this.dashboardData) {
      console.warn('No dashboard data available');
      return;
    }

    // Cast to extended type to access the properties
    const kpiData = this.dashboardData.kpiData as unknown as ExtendedKPIData;
    
    this.kpis = [
      {
        title: 'Total Demandes',
        value: kpiData.totalDemandes || 0
      },
      {
        title: 'En Cours',
        value: kpiData.demandesEnCours || 0
      },
      {
        title: 'Validées',
        value: kpiData.demandesValidees || 0
      },
      {
        title: 'Refusées',
        value: kpiData.demandesRefusees || 0
      }
    ];

    // Add today's authorizations KPI for concierge
    if (this.userRole === 'CONCIERGE' && kpiData.autorisationsAujourdhui !== undefined) {
      this.kpis.push({
        title: 'Autorisations Aujourd\'hui',
        value: kpiData.autorisationsAujourdhui
      });
    }
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  isConcierge(): boolean {
    return this.userRole === 'CONCIERGE';
  }

  // Helper method to get the count of today's authorizations
  getTodayAuthorizationsCount(): number {
    if (!this.dashboardData || !this.dashboardData.autorisationsAujourdhui) return 0;
    return this.dashboardData.autorisationsAujourdhui.length;
  }
}