// dashboard-drh.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { forkJoin } from 'rxjs';
import { Kpi } from '../../models/kpi';
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
  
  // Selected service for detailed view
  selectedService: string = '';
  
  // Date filters
  startDate: string = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  endDate: string = new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0];
  statusStartDate: string = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]; // 2025-01-01
  statusEndDate: string = new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]; // 2025-12-31
  
  
  // UI state
  isLoading: boolean = true;
  errorMessage: string | null = null;
  activeTab: string = 'overview';
  showEmployeeDetails: boolean = false;

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
      accepted: this.dashboardService.getAcceptedRequests(this.startDate, this.endDate)
    }).subscribe({
      next: (results: any) => {
        this.overviewData = results.overview;
        this.statusDistribution = results.status;
        this.leaveBalance = results.balance;
        this.leaveByService = results.byService;
        this.acceptedRequests = results.accepted;
        console.log("results status :", JSON.stringify(results.status, null, 2));

        
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement du dashboard', err);
        this.errorMessage = 'Impossible de charger les données du dashboard.';
        this.isLoading = false;
      }
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

  // Format percentage
  formatPercentage(value: number): string {
    return value.toFixed(2) + '%';
  }

  // Get status distribution for chart
  getStatusDistributionChartData(): any {
    // Ensure we always return valid arrays
    if (!this.statusDistribution || !Array.isArray(this.statusDistribution)) {
      return {
        categories: ['No Data'],
        data: [0],
        percentages: [0]
      };
    }
    console.log(this.statusDistribution)
  
    console.log( this.statusDistribution.map(item => item.status || 'Unknown'),
    this.statusDistribution.map(item => item.count || 0),
  this.statusDistribution.map(item => item.percentage || 0))
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
}