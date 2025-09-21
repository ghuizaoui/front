import { Component, OnInit } from '@angular/core';
import { EmployeService } from '../services/employe/employe.service';
import { Employe } from '../models/Employe.model';
import { HttpErrorResponse } from '@angular/common/http';
import { PopupComponent } from "../shared/popup/popup.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gerer-employes',
  imports: [PopupComponent, CommonModule, FormsModule],
  templateUrl: './gerer-employes.component.html',
  styleUrl: './gerer-employes.component.css'
})
export class GererEmployesComponent implements OnInit {
  // popup variables
  showPopup = false;
  popupTitle = '';
  popupMessage = '';
  popupIsSuccess = false;
  popupRedirectPath: string | null = null;
  showCancelButton = false;

  employes: Employe[] = [];
  filteredEmployes: Employe[] = [];
  searchTerm: string = '';
  isLoading = false;
  selectedDirection: string = 'all';
  selectedService: string = 'all';
  selectedStatus: string = 'all';
  directions: string[] = [];
  services: string[] = [];
  selectedEmployee: Employe | null = null;
  showEmployeeDetails: boolean = false;
  error=''
  

  constructor(private employeService: EmployeService) { }

  ngOnInit(): void {
    this.loadEmployes();
  }

  loadEmployes() {
    this.isLoading = true;
    this.employeService.list().subscribe(
      (employees: Employe[]) => {
        this.employes = employees;
        this.filteredEmployes = [...this.employes];
        this.extractFiltersData();
        this.isLoading = false;
      },
      (err: HttpErrorResponse) => {
        this.handleError(err);
        this.isLoading = false;
      }
    );
  }

  extractFiltersData() {
    // Extract unique directions and services for filters
    this.directions = [...new Set(this.employes.map(e => e.direction))].filter(d => d);
    this.services = [...new Set(this.employes.map(e => e.service))].filter(s => s);
  }

  banne(matricule: string) {
    this.isLoading = true;
    this.employeService.banne(matricule).subscribe(
      () => {
        this.showSuccessPopup('Succès', 'Employé bloqué avec succès', null, false);
        this.loadEmployes();
        this.isLoading = false;
      },
      (err: HttpErrorResponse) => {
        this.handleError(err);
        this.showErrorPopup('Erreur', this.error, null, false);
        this.isLoading = false;
      }
    );
  }

  unbanne(matricule: string) {
    this.isLoading = true;
    this.employeService.unbanne(matricule).subscribe(
      () => {
        this.showSuccessPopup('Succès', 'Employé débloqué avec succès', null, false);
        this.loadEmployes();
        this.isLoading = false;
      },
      (error: HttpErrorResponse) => {
        this.handleError(error);
        this.showErrorPopup('Erreur', this.error, null, false);
        this.isLoading = false;
      }
    );
  }

  viewEmployeeDetails(employee: Employe) {
    this.selectedEmployee = employee;
    this.showEmployeeDetails = true;
  }

  closeEmployeeDetails() {
    this.selectedEmployee = null;
    this.showEmployeeDetails = false;
  }

  filterEmployees() {
    this.filteredEmployes = this.employes.filter(emp => {
      // Search filter
      const matchesSearch = 
        emp.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.matricule?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Direction filter
      const matchesDirection = this.selectedDirection === 'all' || emp.direction === this.selectedDirection;
      
      // Service filter
      const matchesService = this.selectedService === 'all' || emp.service === this.selectedService;
      
      // Status filter (assuming isBanned property exists)
      const matchesStatus = this.selectedStatus === 'all' || 
        (this.selectedStatus === 'active' && !(emp as any).isBanned) || 
        (this.selectedStatus === 'banned' && (emp as any).isBanned);
      
      return matchesSearch && matchesDirection && matchesService && matchesStatus;
    });
  }

  onSearchChange() {
    this.filterEmployees();
  }

  onFilterChange() {
    this.filterEmployees();
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedDirection = 'all';
    this.selectedService = 'all';
    this.selectedStatus = 'all';
    this.filterEmployees();
  }

  private handleError(err: HttpErrorResponse): void {
    console.error('Error:', err);
  
    if (!navigator.onLine) {
      this.error = 'Vous êtes hors ligne. Vérifiez votre connexion internet.';
      return;
    }
  
    switch (err.status) {
      case 0:
        this.error = 'Impossible de se connecter au serveur. Vérifiez que le serveur est en ligne et accessible depuis votre réseau.';
        break;
      case 401:
        this.error = 'Action non autorisée.';
        break;
      case 403:
        this.error = 'Accès refusé. Vous n\'avez pas les droits nécessaires.';
        break;
      case 404:
        this.error = 'Ressource introuvable. Vérifiez l\'URL ou votre réseau.';
        break;
      case 500:
        this.error = 'Erreur serveur. Veuillez réessayer plus tard.';
        break;
      default:
        this.error = 'Erreur inattendue. Veuillez réessayer.';
        break;
    }
  }

  // Popup methods
  showSuccessPopup(title: string, message: string, path: string | null, showCancelButton: boolean) {
    this.popupTitle = title;
    this.popupMessage = message;
    this.popupIsSuccess = true;
    this.popupRedirectPath = path;
    this.showCancelButton = showCancelButton;
    this.showPopup = true;
  }

  showErrorPopup(title: string, errorMessage: string, path: string | null, showCancelButton: boolean) {
    this.popupTitle = title;
    this.popupMessage = errorMessage;
    this.popupIsSuccess = false;
    this.popupRedirectPath = path;
    this.showCancelButton = showCancelButton;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }
}