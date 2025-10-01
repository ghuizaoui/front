// dashboard-drh.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { forkJoin } from 'rxjs';
import { KpiCardsComponent } from "../../dashboard-components/kpi-cards/kpi-cards.component";
import { WelcomeCardComponent } from "../../dashboard-components/welcome-card/welcome-card.component";
import { GenericChartComponent } from "../../dashboard-components/growth-chart/generic-chart.component";
import { WelcomeCardEmployeComponent } from '../dashboard-employe/welcome-card-employe/welcome-card-employe.component';

@Component({
  selector: 'app-dashboard-drh',
  standalone: true,
  imports: [CommonModule, FormsModule, KpiCardsComponent, WelcomeCardComponent, GenericChartComponent, WelcomeCardEmployeComponent],
  templateUrl: './dashboard-drh.component.html',
  styleUrls: ['./dashboard-drh.component.css']
})
export class DashboardDrhComponent implements OnInit {
  // Dashboard data
  overviewData: any = null;
  statusDistribution: any[] = [];
  leaveBalance: any = null;
  leaveByService: any[] = [];
  acceptedRequests: any[] = [];
  employeeLeaveBalance: any[] = [];
  categoryTypeDistribution: any[] = [];
  categoryDistribution: any[] = [];
  
  // Selected service for detailed view
  selectedService: string = '';
  
  // Date filters
  startDate: string = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  endDate: string = new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0];
  statusStartDate: string = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  statusEndDate: string = new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0];
  
  // UI state
  isLoading: boolean = true;
  errorMessage: string | null = null;
  activeTab: string = 'overview';
  showEmployeeDetails: boolean = false;
  categoryViewMode: string = 'detailed'; // 'detailed' or 'aggregated'

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // Load all dashboard data
  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      overview: this.dashboardService.getOverview(this.startDate, this.endDate),
      status: this.dashboardService.getStatusDistribution(this.statusStartDate, this.statusEndDate),
      balance: this.dashboardService.getLeaveBalance(this.startDate, this.endDate),
      byService: this.dashboardService.getLeaveByService(this.startDate, this.endDate),
      accepted: this.dashboardService.getAcceptedRequests(this.startDate, this.endDate),
      categoryType: this.dashboardService.getCategoryTypeDistribution(this.startDate, this.endDate)
    }).subscribe({
      next: (results: any) => {
        this.overviewData = results.overview;
        this.statusDistribution = results.status;
        this.leaveBalance = results.balance;
        this.leaveByService = results.byService;
        this.acceptedRequests = results.accepted;
        this.categoryTypeDistribution = results.categoryType;
        
        // Calculate aggregated category distribution from detailed data
        this.calculateCategoryDistribution();
        
        console.log("Category Type Distribution:", this.categoryTypeDistribution);
        console.log("Aggregated Category Distribution:", this.categoryDistribution);
        
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement du dashboard', err);
        this.errorMessage = 'Impossible de charger les données du dashboard.';
        this.isLoading = false;
      }
    });
  }

  // Calculate aggregated category distribution from detailed data
  calculateCategoryDistribution(): void {
    const categoryMap = new Map();
    
    this.categoryTypeDistribution.forEach(item => {
      const category = item.categorie;
      const count = item.count;
      
      if (categoryMap.has(category)) {
        categoryMap.set(category, categoryMap.get(category) + count);
      } else {
        categoryMap.set(category, count);
      }
    });
    
    // Calculate total for percentages
    const totalCount = Array.from(categoryMap.values()).reduce((sum, count) => sum + count, 0);
    
    // Convert to array of objects
    this.categoryDistribution = Array.from(categoryMap.entries()).map(([categorie, count]) => {
      const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
      return {
        categorie: categorie,
        count: count,
        percentage: Math.round(percentage * 100) / 100
      };
    });
  }

  // Load employee leave balance for a specific service
  loadEmployeeLeaveBalance(service: string): void {
    this.selectedService = service;
    this.showEmployeeDetails = true;
    
    this.dashboardService.getEmployeeLeaveBalance(service, this.startDate, this.endDate)
      .subscribe({
        next: (data: any) => {
          this.employeeLeaveBalance = data;
        },
        error: (err: any) => {
          console.error('Erreur lors du chargement des soldes employés', err);
          this.errorMessage = 'Impossible de charger les soldes des employés.';
        }
      });
  }

  // Apply date filters
  applyFilters(): void {
    this.loadDashboardData();
  }

  // Reset to overview
  resetView(): void {
    this.showEmployeeDetails = false;
    this.selectedService = '';
  }

  // Switch between detailed and aggregated category views
  switchCategoryView(mode: string): void {
    this.categoryViewMode = mode;
  }

  // Format percentage
  formatPercentage(value: number): string {
    return value.toFixed(2) + '%';
  }

  // Get status distribution for chart
  getStatusDistributionChartData(): any {
    if (!this.statusDistribution || !Array.isArray(this.statusDistribution)) {
      return {
        categories: ['No Data'],
        data: [0],
        percentages: [0]
      };
    }

    return {
      categories: this.statusDistribution.map(item => item.status || 'Unknown'),
      data: this.statusDistribution.map(item => item.count || 0),
      percentages: this.statusDistribution.map(item => item.percentage || 0)
    };
  }

  // Get leave by service for chart
  getLeaveByServiceChartData(): any {
    return {
      categories: this.leaveByService.map(item => item.service),
      data: this.leaveByService.map(item => item.joursPris),
      percentages: this.leaveByService.map(item => item.percentage)
    };
  }

  // Get accepted requests for chart
  getAcceptedRequestsChartData(): any {
    return {
      categories: this.acceptedRequests.map(item => item.service),
      data: this.acceptedRequests.map(item => item.demandesAcceptees)
    };
  }

  // Get category type distribution for chart (detailed view)
  getCategoryTypeChartData(): any {
    if (!this.categoryTypeDistribution || !Array.isArray(this.categoryTypeDistribution)) {
      return {
        categories: ['No Data'],
        data: [0],
        percentages: [0]
      };
    }

    // For detailed view, we want to show all types grouped by category
    const categories = [...new Set(this.categoryTypeDistribution.map(item => item.categorie))];
    const data = categories.map(category => {
      const categoryItems = this.categoryTypeDistribution.filter(item => item.categorie === category);
      return categoryItems.reduce((sum, item) => sum + item.count, 0);
    });

    return {
      categories: categories,
      data: data,
      percentages: categories.map(category => {
        const categoryItems = this.categoryTypeDistribution.filter(item => item.categorie === category);
        const totalCount = this.categoryTypeDistribution.reduce((sum, item) => sum + item.count, 0);
        const categoryCount = categoryItems.reduce((sum, item) => sum + item.count, 0);
        return totalCount > 0 ? (categoryCount / totalCount) * 100 : 0;
      })
    };
  }

  // Get aggregated category distribution for chart
  getAggregatedCategoryChartData(): any {
    if (!this.categoryDistribution || !Array.isArray(this.categoryDistribution)) {
      return {
        categories: ['No Data'],
        data: [0],
        percentages: [0]
      };
    }

    return {
      categories: this.categoryDistribution.map(item => item.categorie),
      data: this.categoryDistribution.map(item => item.count),
      percentages: this.categoryDistribution.map(item => item.percentage)
    };
  }

  // Get data for current category view mode
  getCurrentCategoryChartData(): any {
    if (this.categoryViewMode === 'detailed') {
      return this.getCategoryTypeChartData();
    } else {
      return this.getAggregatedCategoryChartData();
    }
  }

  // Get chart type based on view mode
  getCategoryChartType(): 'line' | 'bar' | 'area' | 'pie' | 'doughnut' {
    return this.categoryViewMode === 'detailed' ? 'bar' : 'pie';
  }

  // Get chart title based on view mode
  getCategoryChartTitle(): string {
    return this.categoryViewMode === 'detailed' 
      ? 'Répartition détaillée des demandes par catégorie'
      : 'Répartition des demandes par catégorie';
  }

  // Get series name based on view mode
  getCategorySeriesName(): string {
    return this.categoryViewMode === 'detailed' ? 'Catégories' : 'Demandes';
  }
}