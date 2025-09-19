// src/app/historique-demandes/historique-demandes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DemandeService } from '../services/demande/demande.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Demande } from '../models/Demande.model';
import { StatutDemande, STATUT_LABELS } from '../models/StatutDemande.model';

@Component({
  selector: 'app-historique-demandes',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './historique-demandes.component.html',
  styleUrls: ['./historique-demandes.component.css']
})
export class HistoriqueDemandesComponent implements OnInit {

  allDemandes: Demande[] = [];
  filteredDemandes: Demande[] = [];
  validatedDemandes: Demande[] = [];
  refusedDemandes: Demande[] = [];
  
  // Filter properties
  searchText: string = '';
  selectedCategory: string = 'all';
  selectedStatus: string = 'all';
  selectedType: string = 'all';
  dateRange: string = 'all';
  startDate: string = '';
  endDate: string = '';
  
  // UI state
  isLoading = false;
  errorMessage: string | null = null;
  activeTab: 'all' | 'validated' | 'refused' = 'all';
  
  // Constants
  readonly STATUT_LABELS = STATUT_LABELS;
  categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'CONGE_STANDARD', label: 'Congé Standard' },
    { value: 'CONGE_EXCEPTIONNEL', label: 'Congé Exceptionnel' },
    { value: 'AUTORISATION', label: 'Autorisation' },
    { value: 'ORDRE_MISSION', label: 'Ordre de Mission' }
  ];
  
  statuses = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'VALIDEE', label: 'Validée' },
    { value: 'REFUSEE', label: 'Refusée' },
    { value: 'EN_ATTENTE_DRH', label: 'En attente DRH' }
  ];

  dateRanges = [
    { value: 'all', label: 'Toutes les dates' },
    { value: 'today', label: "Aujourd'hui" },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  constructor(private demandeService: DemandeService) { }

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.demandeService.getAllDemandes().subscribe({
      next: (data: Demande[]) => {
        this.allDemandes = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error("Erreur lors de la récupération de l'historique des demandes :", error);
        this.errorMessage = "Impossible de charger les demandes. Veuillez vérifier la connexion au serveur.";
        this.isLoading = false;
        this.allDemandes = [];
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allDemandes];

    // Search filter
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(demande =>
        demande.id?.toString().includes(searchLower) ||
        demande.employe?.nom?.toLowerCase().includes(searchLower) ||
        demande.employe?.prenom?.toLowerCase().includes(searchLower) ||
        demande.typeDemande?.toLowerCase().includes(searchLower) ||
        demande.missionObjet?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(demande => demande.categorie === this.selectedCategory);
    }

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(demande => demande.statut === this.selectedStatus);
    }

    // Date range filter
    if (this.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = new Date();

      switch (this.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - now.getDay()));
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'custom':
          if (this.startDate && this.endDate) {
            startDate = new Date(this.startDate);
            endDate = new Date(this.endDate);
            endDate.setHours(23, 59, 59, 999);
          } else {
            break;
          }
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }

      filtered = filtered.filter(demande => {
        if (!demande.dateCreation) return false;
        const demandeDate = new Date(demande.dateCreation);
        return demandeDate >= startDate && demandeDate <= endDate;
      });
    }

    this.filteredDemandes = filtered;
    this.validatedDemandes = this.filteredDemandes.filter(d => d.statut === 'VALIDEE');
    this.refusedDemandes = this.filteredDemandes.filter(d => d.statut === 'REFUSEE');
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategory = 'all';
    this.selectedStatus = 'all';
    this.selectedType = 'all';
    this.dateRange = 'all';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  getStatusClass(statut: StatutDemande): string {
    switch (statut) {
      case 'VALIDEE': return 'status-validated';
      case 'REFUSEE': return 'status-refused';
      case 'EN_COURS': return 'status-pending';
      case 'EN_ATTENTE_DRH': return 'status-waiting';
      default: return 'status-default';
    }
  }

  getCategoryLabel(categorie: string): string {
    const categoryMap: { [key: string]: string } = {
      'CONGE_STANDARD': 'Congé Standard',
      'CONGE_EXCEPTIONNEL': 'Congé Exceptionnel',
      'AUTORISATION': 'Autorisation',
      'ORDRE_MISSION': 'Ordre de Mission'
    };
    return categoryMap[categorie] || categorie;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDemandePeriod(demande: Demande): string {
    if (demande.congeDateDebut && demande.congeDateFin) {
      return `${this.formatDate(demande.congeDateDebut)} - ${this.formatDate(demande.congeDateFin)}`;
    } else if (demande.autoDateDebut) {
      return this.formatDate(demande.autoDateDebut);
    } else if (demande.missionDateDebut && demande.missionDateFin) {
      return `${this.formatDate(demande.missionDateDebut)} - ${this.formatDate(demande.missionDateFin)}`;
    }
    return 'N/A';
  }

  getDemandeDetails(demande: Demande): string {
    if (demande.missionObjet) {
      return demande.missionObjet;
    } else if (demande.typeDemande) {
      return demande.typeDemande;
    }
    return this.getCategoryLabel(demande.categorie);
  }
}