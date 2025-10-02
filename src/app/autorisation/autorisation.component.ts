import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Demande } from '../models/Demande.model';
import { DemandeService } from '../services/demande/demande.service';
import { PopupComponent } from "../shared/popup/popup.component";

@Component({
  selector: 'app-autorisation',
  standalone: true,
  imports: [CommonModule, FormsModule, PopupComponent],
  templateUrl: './autorisation.component.html',
  styleUrls: ['./autorisation.component.css']
})
export class AutorisationComponent implements OnInit {
  demandes: Demande[] = [];
  filteredDemandes: Demande[] = [];
  errorMessage: string | null = null;
  isLoading: boolean = false;
  
  // Filtres
  selectedCategory: string = 'ALL';
  selectedStatus: string = 'VALIDEE'; // Default to only show validated
  searchTerm: string = '';

  // NEW: Liberation functionality
  showLiberationModal: boolean = false;
  selectedDemandeForLiberation: Demande | null = null;
  liberationComment: string = '';
  isLiberating: boolean = false;

  // Catégories disponibles
  categories = [
    { value: 'ALL', label: 'Toutes les catégories' },
    { value: 'AUTORISATION', label: 'Autorisations' },
    { value: 'ORDRE_MISSION', label: 'Ordres de mission' }
  ];

  // Statuts disponibles - Only show VALIDEE since we only want validated demands
  statuses = [
    { value: 'VALIDEE', label: 'Validé' }
  ];

  constructor(private demandeService: DemandeService) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.isLoading = true;
    this.demandeService.getAllAutorisation().subscribe({
      next: (demandes) => {
        console.log("Chargement réussi", demandes);
        // Filter to show only VALIDEE demands (autorisations and missions)
        this.demandes = demandes.filter(demande => 
          demande.statut === 'VALIDEE' && 
          (demande.categorie === 'AUTORISATION' || demande.categorie === 'ORDRE_MISSION')
        );
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Erreur lors du chargement des demandes.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredDemandes = this.demandes.filter(demande => {
      // Filtre par catégorie
      const categoryMatch = this.selectedCategory === 'ALL' || 
                           demande.categorie === this.selectedCategory;
      
      // Filtre par statut - always VALIDEE since we only load validated demands
      const statusMatch = this.selectedStatus === 'ALL' || 
                         demande.statut === this.selectedStatus;
      
      // Filtre par recherche (nom, prénom, matricule, email)
      const searchMatch = !this.searchTerm || 
                         demande.employe?.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         demande.employe?.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         demande.employe?.matricule?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         demande.employe?.email?.toLowerCase().includes(this.searchTerm.toLowerCase());

      return categoryMatch && statusMatch && searchMatch;
    });
  }

  // NEW: Check if demande can be liberated
  canLiberateDemande(demande: Demande): boolean {
    return demande.statut === 'VALIDEE' && !demande.estLiberer;
  }

  // NEW: Open liberation modal
  openLiberationModal(demande: Demande): void {
    if (this.canLiberateDemande(demande)) {
      this.selectedDemandeForLiberation = demande;
      this.liberationComment = '';
      this.showLiberationModal = true;
    }
  }

  // NEW: Close liberation modal
  closeLiberationModal(): void {
    this.showLiberationModal = false;
    this.selectedDemandeForLiberation = null;
    this.liberationComment = '';
    this.isLiberating = false;
  }

  // FIXED: Use the correct liberer method from DemandeService
  libererDemande(): void {
    if (!this.selectedDemandeForLiberation) return;

    this.isLiberating = true;
    
    // Use the correct liberer method from DemandeService
    this.demandeService.liberer(
      this.selectedDemandeForLiberation.id!, 
      this.liberationComment
    ).subscribe({
      next: (response) => {
        console.log('Demande libérée avec succès:', response);
        
        // Update the local demande with liberation status
        const index = this.demandes.findIndex(d => d.id === this.selectedDemandeForLiberation!.id);
        if (index !== -1) {
          this.demandes[index] = { ...this.demandes[index], estLiberer: true };
        }
        
        this.applyFilters();
        this.closeLiberationModal();
        this.isLiberating = false;
        
        // Show success message (you can use a toast service here)
        alert('Demande libérée avec succès!');
      },
      error: (err) => {
        console.error('Erreur lors de la libération:', err);
        this.errorMessage = 'Erreur lors de la libération de la demande.';
        this.isLiberating = false;
      }
    });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategory = 'ALL';
    this.selectedStatus = 'VALIDEE'; // Reset to only validated
    this.searchTerm = '';
    this.applyFilters();
  }

  getCategoryLabel(categorie: string): string {
    const labels: Record<string, string> = {
      'AUTORISATION': 'Autorisation',
      'ORDRE_MISSION': 'Ordre de mission'
    };
    return labels[categorie] || categorie;
  }

  getStatusBadgeClass(statut: string): string {
    switch (statut) {
      case 'VALIDEE': return 'status-badge status-valid';
      case 'REFUSEE': return 'status-badge status-refused';
      case 'EN_COURS': return 'status-badge status-pending';
      default: return 'status-badge';
    }
  }

  getStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      'EN_COURS': 'En cours',
      'VALIDEE': 'Validé',
      'REFUSEE': 'Refusé'
    };
    return labels[statut] || statut;
  }

  // NEW: Get liberation status badge
  getLiberationBadgeClass(demande: Demande): string {
    if (demande.estLiberer) {
      return 'liberation-badge liberated';
    } else if (this.canLiberateDemande(demande)) {
      return 'liberation-badge ready-for-liberation';
    } else {
      return 'liberation-badge not-ready';
    }
  }

  // NEW: Get liberation status label
  getLiberationLabel(demande: Demande): string {
    if (demande.estLiberer) {
      return 'Libérée';
    } else if (this.canLiberateDemande(demande)) {
      return 'À libérer';
    } else {
      return 'Non libérable';
    }
  }

  getDisplayDate(demande: Demande): string {
    if (demande.categorie === 'AUTORISATION') {
      return demande.autoDateDebut ? new Date(demande.autoDateDebut).toLocaleDateString('fr-FR') : 'N/A';
    } else if (demande.categorie === 'ORDRE_MISSION') {
      return demande.missionDateDebut ? new Date(demande.missionDateDebut).toLocaleDateString('fr-FR') : 'N/A';
    }
    return 'N/A';
  }

  getDisplayTime(demande: Demande): string {
    if (demande.categorie === 'AUTORISATION') {
      return `${demande.autoHeureDebut || 'N/A'} - ${demande.autoHeureFin || 'N/A'}`;
    } else if (demande.categorie === 'ORDRE_MISSION') {
      return `${demande.missionHeureDebut || 'N/A'} - ${demande.missionHeureFin || 'N/A'}`;
    }
    return 'N/A';
  }

  getMissionObjet(demande: Demande): string {
    return demande.missionObjet || 'Non spécifié';
  }
}