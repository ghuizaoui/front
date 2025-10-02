import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Demande } from '../models/Demande.model';
import { DemandeService } from '../services/demande/demande.service';
import { CategorieDemande } from '../models/Categoriedemande.model';
import { StatutDemande } from '../models/StatutDemande.model';

@Component({
  selector: 'app-demandes-today',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './demandes-today.component.html',
  styleUrls: ['./demandes-today.component.css']
})
export class DemandesTodayComponent implements OnInit {

  constructor(private demandeService: DemandeService) {}

  demandes: Demande[] = [];
  filteredDemandes: Demande[] = [];
  loading = false;
  error: string | null = null;

  // Filtres
  searchTerm: string = '';
  selectedCategorie: string = 'all';
  selectedStatut: string = 'all';

  // NEW: Liberation functionality
  showLiberationModal: boolean = false;
  selectedDemandeForLiberation: Demande | null = null;
  liberationComment: string = '';
  isLiberating: boolean = false;

  // Options de filtres
  categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'AUTORISATION', label: 'Autorisation' },
    { value: 'ORDRE_MISSION', label: 'Ordre de mission' },
    { value: 'CONGE_STANDARD', label: 'Congé standard' },
    { value: 'CONGE_EXCEPTIONNEL', label: 'Congé exceptionnel' }
  ];

  statuts = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'VALIDEE', label: 'Validée' },
    { value: 'REFUSEE', label: 'Refusée' }
  ];

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading = true;
    this.error = null;
    
    this.demandeService.getDemandesToday().subscribe({
      next: (demandes) => {
        this.demandes = demandes;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des demandes:', err);
        this.error = 'Impossible de charger les demandes du jour.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredDemandes = this.demandes.filter(demande => {
      // Filtre par recherche
      const matchesSearch = this.searchTerm === '' || 
        demande.employe?.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        demande.employe?.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        demande.employe?.matricule?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        demande.missionObjet?.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtre par catégorie
      const matchesCategorie = this.selectedCategorie === 'all' || 
        demande.categorie === this.selectedCategorie;

      // Filtre par statut
      const matchesStatut = this.selectedStatut === 'all' || 
        demande.statut === this.selectedStatut;

      return matchesSearch && matchesCategorie && matchesStatut;
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
        
        // Show success message
        alert('Demande libérée avec succès!');
      },
      error: (err) => {
        console.error('Erreur lors de la libération:', err);
        this.error = 'Erreur lors de la libération de la demande.';
        this.isLiberating = false;
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategorie = 'all';
    this.selectedStatut = 'all';
    this.applyFilters();
  }

  getCategoryClass(categorie: string): string {
    switch (categorie) {
      case 'AUTORISATION':
        return 'category-autorisation';
      case 'ORDRE_MISSION':
        return 'category-ordre_mission';
      case 'CONGE_STANDARD':
        return 'category-conge_standard';
      case 'CONGE_EXCEPTIONNEL':
        return 'category-conge_exceptionnel';
      default:
        return 'category-default';
    }
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'VALIDEE':
        return 'status-valid';
      case 'EN_COURS':
        return 'status-pending';
      case 'REFUSEE':
        return 'status-refused';
      default:
        return 'status-default';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'VALIDEE':
        return 'Validée';
      case 'EN_COURS':
        return 'En cours';
      case 'REFUSEE':
        return 'Refusée';
      default:
        return statut;
    }
  }

  // NEW: Get liberation status class
  getLiberationClass(demande: Demande): string {
    if (demande.estLiberer) {
      return 'liberation-liberated';
    } else if (this.canLiberateDemande(demande)) {
      return 'liberation-ready';
    } else {
      return 'liberation-not-ready';
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

  getCategoryLabel(categorie: string): string {
    switch (categorie) {
      case 'AUTORISATION':
        return 'Autorisation';
      case 'ORDRE_MISSION':
        return 'Ordre Mission';
      case 'CONGE_STANDARD':
        return 'Congé Standard';
      case 'CONGE_EXCEPTIONNEL':
        return 'Congé Exceptionnel';
      default:
        return categorie;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  }

  safeFormatDate(date?: string | Date | null): string {
    return date ? formatDate(date, 'dd/MM/yyyy', 'fr-FR') : '-';
  }
}