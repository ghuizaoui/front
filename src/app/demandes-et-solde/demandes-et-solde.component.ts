import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemandeService } from '../services/demande/demande.service';
import { Demande } from '../models/Demande.model';
import { EmployeSoldeDto } from '../models/EmployeSoldeDto';
import { PopupComponent } from "../shared/popup/popup.component";
import { STATUT_LABELS } from '../models/StatutDemande.model';


@Component({
  selector: 'app-demandes-et-solde',
  imports: [CommonModule, PopupComponent],
  templateUrl: './demandes-et-solde.component.html',
  styleUrl: './demandes-et-solde.component.css'
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
  empSol: EmployeSoldeDto | null = null;
  activeTab: string = 'all'; // 'all', 'en_cours', 'validee', 'refusee'
  isLoading = true;

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

  getFilteredDemandes() {
    if (this.activeTab === 'all') {
      return this.demandes;
    }
    return this.demandes.filter(d => d.statut === this.activeTab.toUpperCase());
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_COURS': return 'status-en-cours';
      case 'VALIDEE': return 'status-validee';
      case 'REFUSEE': return 'status-refusee';
      default: return 'status-default';
    }
  }

  getStatusLabel(status: string): string {
    return STATUT_LABELS[status as keyof typeof STATUT_LABELS] || status;
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