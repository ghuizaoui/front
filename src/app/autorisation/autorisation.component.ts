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
  selectedStatus: string = 'ALL';
  searchTerm: string = '';

  // Catégories disponibles
  categories = [
    { value: 'ALL', label: 'Toutes les catégories' },
    { value: 'AUTORISATION', label: 'Autorisations' },
    { value: 'ORDRE_MISSION', label: 'Ordres de mission' }
  ];

  // Statuts disponibles
  statuses = [
    { value: 'ALL', label: 'Tous les statuts' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'VALIDE', label: 'Validé' },
    { value: 'REFUSE', label: 'Refusé' }
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
        this.demandes = demandes;
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
      
      // Filtre par statut
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
    this.selectedStatus = 'ALL';
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
      case 'VALIDE': return 'status-badge status-valid';
      case 'REFUSE': return 'status-badge status-refused';
      case 'EN_COURS': return 'status-badge status-pending';
      default: return 'status-badge';
    }
  }

  getStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      'EN_COURS': 'En cours',
      'VALIDE': 'Validé',
      'REFUSE': 'Refusé'
    };
    return labels[statut] || statut;
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