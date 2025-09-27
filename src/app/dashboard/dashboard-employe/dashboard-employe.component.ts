import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeCardComponent } from "../../dashboard-components/welcome-card/welcome-card.component";
import { DashboardEmployeService, EmployeDashboardDTO, KPIData, DemandeRecente, AutorisationAujourdhui } from '../../services/dashboard-employe/dashboard-employe.service';
import { AuthService } from '../../services/auth/auth.service';
import { KpiCardsComponent } from "../../dashboard-components/kpi-cards/kpi-cards.component";
import { GenericChartComponent } from "../../dashboard-components/growth-chart/generic-chart.component";
import { Kpi } from '../../models/kpi';
import { WelcomeCardEmployeComponent } from "../welcome-card-employe/welcome-card-employe.component";

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

  // Last three demandes
  lastThreeDemandes: DemandeRecente[] = [];

  constructor(
    private dashboardEmploye: DashboardEmployeService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.dashboardEmploye.getDashboard().subscribe({
      next: (data: EmployeDashboardDTO) => {
        console.log("Dashboard data received: ", data);
        if (!data) {
          console.error('Invalid dashboard data:', data);
          this.errorMessage = 'Données du dashboard invalides ou incomplètes.';
          this.isLoading = false;
          return;
        }
        this.dashboardData = data;
        this.prepareChartData();
        this.prepareKpiData();
        this.prepareLastThreeDemandes();
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

    // Use the actual KPIData interface from your service
    const kpiData = this.dashboardData.kpiData;
    
    this.kpis = [
      {
        title: 'Total Congés',
        value: kpiData.totalConges || 0
      },
      {
        title: 'Total Autorisations',
        value: kpiData.totalAutorisations || 0
      },
      {
        title: 'Total Demandes',
        value: kpiData.totalDemandes || 0
      }
    ];

    // Add today's authorizations KPI for concierge
    if (this.userRole === 'CONCIERGE' && this.dashboardData.autorisationsAujourdhui) {
      this.kpis.push({
        title: 'Autorisations Aujourd\'hui',
        value: this.dashboardData.autorisationsAujourdhui.length
      });
    }
  }

  private prepareLastThreeDemandes(): void {
    if (!this.dashboardData?.demandesRecentes || this.dashboardData.demandesRecentes.length === 0) {
      this.lastThreeDemandes = [];
      console.log('No demandesRecentes available or empty array');
      return;
    }

    console.log('All demandes recentes:', this.dashboardData.demandesRecentes);
    console.log('Number of demandes recentes:', this.dashboardData.demandesRecentes.length);

    // Method 1: Try sorting by dateCreation (most robust approach)
    try {
      const sortedDemandes = [...this.dashboardData.demandesRecentes].sort((a, b) => {
        // Parse dates safely
        const dateA = this.parseDate(a.dateCreation);
        const dateB = this.parseDate(b.dateCreation);
        
        // Sort by date descending (newest first)
        return dateB.getTime() - dateA.getTime();
      });
      
      this.lastThreeDemandes = sortedDemandes.slice(0, 3);
      console.log('Sorted by date - Last three demandes:', this.lastThreeDemandes);
      
    } catch (error) {
      console.error('Error sorting by date, trying fallback methods:', error);
      
      // Method 2: Try sorting by ID (assuming higher ID = more recent)
      try {
        this.lastThreeDemandes = [...this.dashboardData.demandesRecentes]
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 3);
        console.log('Fallback - Sorted by ID - Last three demandes:', this.lastThreeDemandes);
      } catch (idError) {
        // Method 3: Just take the first 3 (simplest approach)
        this.lastThreeDemandes = this.dashboardData.demandesRecentes.slice(0, 3);
        console.log('Final fallback - First three demandes:', this.lastThreeDemandes);
      }
    }

    // Debug output for verification
    this.lastThreeDemandes.forEach((demande, index) => {
      console.log(`Last Demande ${index + 1}:`, {
        id: demande.id,
        type: demande.typeDemande,
        categorie: demande.categorie,
        statut: demande.statut,
        dateCreation: demande.dateCreation,
        parsedDate: this.parseDate(demande.dateCreation)
      });
    });
  }

  // Safe date parsing method
  private parseDate(dateString: string): Date {
    if (!dateString) return new Date(0); // Return epoch date if null/undefined
    
    // Try different date formats
    const parsedDate = new Date(dateString);
    
    if (isNaN(parsedDate.getTime())) {
      // If standard parsing fails, try common formats
      const formats = [
        dateString.replace(' ', 'T'), // Convert space to T for ISO format
        dateString.split(' ')[0], // Take only date part
        dateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1') // DD/MM/YYYY to YYYY-MM-DD
      ];
      
      for (const format of formats) {
        const testDate = new Date(format);
        if (!isNaN(testDate.getTime())) {
          return testDate;
        }
      }
      
      console.warn('Unable to parse date:', dateString);
      return new Date(0); // Return epoch date as fallback
    }
    
    return parsedDate;
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

  // Helper method to format date for display
  formatDate(dateString: string): string {
    try {
      const date = this.parseDate(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  }
}