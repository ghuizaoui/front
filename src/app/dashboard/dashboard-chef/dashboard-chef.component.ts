import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { KpiCardsComponent } from "../../dashboard-components/kpi-cards/kpi-cards.component";
import { WelcomeCardComponent } from "../../dashboard-components/welcome-card/welcome-card.component";
import { GenericChartComponent } from "../../dashboard-components/growth-chart/generic-chart.component";
import { DashboardChefService, DashboardChefDTO, VueEnsembleDemandes, RepartitionStatuts, JoursCongesPris, DemandesAccepteesService, SoldeEmploye } from '../../services/dashboard-chef/dashboard-chef.service';
import { WelcomeCardEmployeComponent } from "../welcome-card-employe/welcome-card-employe.component";

@Component({
  selector: 'app-dashboard-chef',
  standalone: true,
  imports: [CommonModule, FormsModule, KpiCardsComponent, WelcomeCardComponent, GenericChartComponent, WelcomeCardEmployeComponent],
  templateUrl: './dashboard-chef.component.html',
  styleUrls: ['./dashboard-chef.component.css']
})
export class DashboardChefComponent implements OnInit {
  // Dashboard data
  dashboardData: DashboardChefDTO | null = null;
  
  // Selected service for detailed view
  selectedService: string = '';
  
  // Date filters
  startDate: string = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  endDate: string = new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0];
  
  // UI state
  isLoading: boolean = true;
  errorMessage: string | null = null;
  activeTab: string = 'overview';
  showEmployeeDetails: boolean = false;

  constructor(private dashboardChefService: DashboardChefService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // Load all dashboard data
  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.dashboardChefService.getDashboardChef(this.startDate, this.endDate)
      .subscribe({
        next: (data: DashboardChefDTO) => {
          this.dashboardData = data;
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Erreur lors du chargement du dashboard chef', err);
          this.errorMessage = 'Impossible de charger les données du dashboard.';
          this.isLoading = false;
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
    if (!this.dashboardData?.repartitionStatuts) {
      return {
        categories: ['No Data'],
        data: [0],
        percentages: [0]
      };
    }

    const statuts = this.dashboardData.repartitionStatuts;
    return {
      categories: ['En cours', 'Validées', 'Refusées'],
      data: [statuts.enCours, statuts.validees, statuts.refusees],
      percentages: [statuts.pourcentageEnCours, statuts.pourcentageValidees, statuts.pourcentageRefusees]
    };
  }

  // Get demand types for chart
  getDemandTypesChartData(): any {
    if (!this.dashboardData?.vueEnsembleDemandes) {
      return {
        categories: ['No Data'],
        data: [0],
        percentages: [0]
      };
    }

    const vueEnsemble = this.dashboardData.vueEnsembleDemandes;
    return {
      categories: ['Congés', 'Autorisations', 'Ordres Mission'],
      data: [vueEnsemble.totalConges, vueEnsemble.totalAutorisations, vueEnsemble.totalOrdresMission],
      percentages: [vueEnsemble.pourcentageConges, vueEnsemble.pourcentageAutorisations, vueEnsemble.pourcentageOrdresMission]
    };
  }

  // Get accepted requests for chart
  getAcceptedRequestsChartData(): any {
    if (!this.dashboardData?.demandesAccepteesServices) {
      return {
        categories: ['No Data'],
        data: [0]
      };
    }

    return {
      categories: this.dashboardData.demandesAccepteesServices.map(item => item.service),
      data: this.dashboardData.demandesAccepteesServices.map(item => item.demandesAcceptees)
    };
  }

  // Get leave evolution for chart
  getLeaveEvolutionChartData(): any {
    if (!this.dashboardData?.joursCongesPris?.evolutionParMois) {
      return {
        categories: ['No Data'],
        data: [0]
      };
    }

    const evolution = this.dashboardData.joursCongesPris.evolutionParMois;
    return {
      categories: evolution.map(item => item.mois),
      data: evolution.map(item => item.joursPris)
    };
  }
}