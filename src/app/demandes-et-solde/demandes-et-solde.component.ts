import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemandeService } from '../services/demande/demande.service';
import { Demande } from '../models/Demande.model';
import { EmployeSoldeDto } from '../models/EmployeSoldeDto';
import { PopupComponent } from "../shared/popup/popup.component";
import { STATUT_LABELS } from '../models/StatutDemande.model';

@Component({
  selector: 'app-demandes-et-solde',
  imports: [CommonModule, FormsModule, PopupComponent],
  templateUrl: './demandes-et-solde.component.html',
  styleUrls:['./demandes-et-solde.component.css']
})
export class DemandesEtSoldeComponent implements OnInit {

  // popup variables
  showPopup = false;
  popupTitle = '';
  popupMessage = '';
  popupIsSuccess = false;
  popupRedirectPath: string | null = null;
  showCancelButton = false;

  demandes: Demande[] = [];
  filteredDemandes: Demande[] = [];
  empSol: EmployeSoldeDto | null = null;
  activeTab: string = 'all'; // 'all', 'en_cours', 'validee', 'refusee'
  isLoading = true;

  // Filter variables
  searchTerm: string = '';
  selectedCategory: string = 'all';
  selectedType: string = 'all';
  dateRange: { start: string, end: string } = { start: '', end: '' };

  // Available filters
  categories: string[] = ['all', 'CONGE', 'AUTORISATION', 'MISSION'];
  types: string[] = ['all'];

  constructor(private demandeService: DemandeService) {
  }

  ngOnInit(): void {
    this.loadDemandes();
    this.loadEmploySoldeDto();
  }

  loadDemandes() {
    this.isLoading = true;
    this.demandeService.getHistoriqueDemandes().subscribe(
      req => {
        console.log("load Demandes successfully");
        this.demandes = req;
        this.filteredDemandes = req;
        this.extractUniqueTypes();
        this.applyFilters();
        this.isLoading = false;
      },
      error => {
        console.log("error when loading the Demandes");
        this.showErrorPopup('Erreur', 'Erreur lors du chargement des demandes', null, false);
        this.isLoading = false;
      }
    )
  }

  loadEmploySoldeDto() {
    this.demandeService.getEmployeSolde().subscribe(
      req => {
        console.log("load employ solde successfully");
        this.empSol = req;
      },
      error => {
        console.log("error when loading the employ solde");
      }
    )
  }

  extractUniqueTypes() {
    const uniqueTypes = new Set<string>();
    this.demandes.forEach(demande => {
      if (demande.typeDemande) {
        uniqueTypes.add(demande.typeDemande);
      }
    });
    this.types = ['all', ...Array.from(uniqueTypes)];
  }

  applyFilters() {
    let filtered = this.demandes;

    // Apply status filter
    if (this.activeTab !== 'all') {
      filtered = filtered.filter(d => d.statut === this.activeTab.toUpperCase());
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.id.toString().includes(term) ||
        (d.commentaireRefus && d.commentaireRefus.toLowerCase().includes(term)) ||
        (d.typeDemande && d.typeDemande.toLowerCase().includes(term)) ||
        (d.categorie && d.categorie.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(d => d.categorie === this.selectedCategory);
    }

    // Apply type filter
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(d => d.typeDemande === this.selectedType);
    }

    // Apply date range filter
    if (this.dateRange.start) {
      filtered = filtered.filter(d => {
        const date = this.getDemandeDate(d);
        return date >= this.dateRange.start;
      });
    }

    if (this.dateRange.end) {
      filtered = filtered.filter(d => {
        const date = this.getDemandeDate(d);
        return date <= this.dateRange.end;
      });
    }

    this.filteredDemandes = filtered;
  }

  getDemandeDate(demande: Demande): string {
    if (demande.congeDateDebut) return demande.congeDateDebut;
    if (demande.autoDateDebut) return demande.autoDateDebut;
    if (demande.missionDateDebut) return demande.missionDateDebut;
    return demande.dateCreation || '';
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.selectedType = 'all';
    this.dateRange = { start: '', end: '' };
    this.applyFilters();
  }

  onTabChange(tab: string) {
    this.activeTab = tab;
    this.applyFilters();
  }

  cancelDemande(demandeId: number) {
    this.demandeService.cancelDemande(demandeId).subscribe(
      req => {
        this.showSuccessPopup('Succès', 'Demande annulée avec succès', null, true);
        this.loadDemandes(); // Reload the list
      },
      err => {
        this.showErrorPopup('Erreur', 'Erreur lors de l\'annulation de la demande', null, true);
      }
    )
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_COURS': return 'status-pending';
      case 'VALIDEE': return 'status-valid';
      case 'REFUSEE': return 'status-refused';
      default: return 'status-default';
    }
  }

  getStatusLabel(status: string): string {
    return STATUT_LABELS[status as keyof typeof STATUT_LABELS] || status;
  }

  getCategoryClass(category: string): string {
    switch (category) {
      case 'AUTORISATION': return 'category-autorisation';
      case 'MISSION': return 'category-ordre_mission';
      case 'CONGE': return 'category-conge';
      default: return 'category-default';
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  formatDateTime(dateString: string | undefined, timeString: string | undefined): string {
    if (!dateString) return 'N/A';
    
    let result = this.formatDate(dateString);
    if (timeString) {
      result += ' ' + timeString.substring(0, 5);
    }
    return result;
  }

  // popup methods
  showSuccessPopup(title: string, message: string, path: string | null, showCancelButton: boolean) {
    this.popupTitle = title;
    this.popupMessage = message;
    this.popupIsSuccess = true;
    this.popupRedirectPath = path;
    this.showCancelButton = showCancelButton;
    this.showPopup = true;
  }

  showErrorPopup(title: string, errorMessage: string, path: string | null, showCancelButton: boolean) {
    console.log('show error popup activated');
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