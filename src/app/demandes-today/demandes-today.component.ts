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
  successMessage: string | null = null; 

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

  // Fonction utilitaire pour obtenir la date du jour au format YYYY-MM-DD
  private getTodayDateString(): string {
    return formatDate(new Date(), 'yyyy-MM-dd', 'en-US'); // Utiliser 'en-US' pour un format de date ISO standard
  }

  // Fonction utilitaire pour obtenir la date d'une demande au format YYYY-MM-DD
  private getDemandeDateString(date?: string | Date | null): string | null {
    if (!date) return null;
    // Assurez-vous que l'objet date est correct, si c'est un string ISO, formatDate le gère
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }
  
  // Fonction utilitaire pour obtenir la date de début de la demande
  private getDemandeStartDateString(demande: Demande): string | null {
    const date = demande.congeDateDebut || demande.autoDateDebut || demande.missionDateDebut;
    return this.getDemandeDateString(date);
  }

  loadDemandes(): void {
    this.loading = true;
    this.error = null;
    this.successMessage = null;
    
    // IMPORTANT : Le service doit retourner TOUTES les demandes non libérées 
    // ou au moins celles "VALIDEE" pour que le filtrage côté client fonctionne
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
    const todayString = this.getTodayDateString();

    // 1. Logique du Concierge : Filtrer pour ne garder que les demandes pertinentes AUJOURD'HUI.
    let conciergeFiltered = this.demandes.filter(demande => {
        // Le concierge ne doit s'occuper que des demandes VALIDÉES ou EN_COURS
        // Par défaut, on filtre sur VALIDEE pour la libération
        const isValideeOrEnCours = demande.statut === 'VALIDEE' || demande.statut === 'EN_COURS';

        if (!isValideeOrEnCours) {
          return false;
        }

        const isAutorisation = demande.categorie === 'AUTORISATION';
        const isMission = demande.categorie === 'ORDRE_MISSION';
        const isConge = demande.categorie === 'CONGE_STANDARD' || demande.categorie === 'CONGE_EXCEPTIONNEL';
        
        // Date de début
        const startDateString = this.getDemandeStartDateString(demande);
        
        // Date de création (soumission)
        const creationDateString = this.getDemandeDateString(demande.dateCreation);
        
        // Condition : Est-ce que la demande doit s'afficher pour le concierge AUJOURD'HUI ?
        
        if (isAutorisation || isMission) {
            // Autorisation/Mission : Afficher UNIQUEMENT si la demande a été créée AUJOURD'HUI
            // Explication : Demande passée le 06 (creationDate=06). On est le 06. Affiche.
            // Demande passée le 06 (creationDate=06). On est le 07. N'affiche pas.
            return creationDateString === todayString;
        } 
        
        if (isConge) {
            // Congé : Afficher UNIQUEMENT si la date de début est AUJOURD'HUI
            // Explication : Demande pour le 07 (startDate=07). On est le 06. N'affiche pas.
            // Demande pour le 07 (startDate=07). On est le 07. Affiche.
            return startDateString === todayString;
        }
        
        // Par défaut, n'affiche rien d'autre
        return false;
    });

    // 2. Application des filtres utilisateur (Recherche, Catégorie, Statut) sur le sous-ensemble du Concierge
    this.filteredDemandes = conciergeFiltered.filter(demande => {
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
      // NOTE: Garde le filtre Statut au cas où le concierge doit voir des EN_COURS ou autres
      const matchesStatut = this.selectedStatut === 'all' ||  
        demande.statut === this.selectedStatut; 

      return matchesSearch && matchesCategorie && matchesStatut; 
    });
  }

  canLiberateDemande(demande: Demande): boolean {
    // Uniquement les demandes VALIDÉES et NON libérées peuvent être libérées
    return demande.statut === 'VALIDEE' && !demande.estLiberer;
  }

  openLiberationModal(demande: Demande): void {
    if (this.canLiberateDemande(demande)) {
      this.selectedDemandeForLiberation = demande;
      this.liberationComment = '';
      this.showLiberationModal = true;
      this.error = null;
      this.successMessage = null;
    }
  }

  closeLiberationModal(): void {
    this.showLiberationModal = false;
    this.selectedDemandeForLiberation = null;
    this.liberationComment = '';
    this.isLiberating = false;
  }

  libererDemande(): void {
    if (!this.selectedDemandeForLiberation) return;

    this.isLiberating = true;
    this.error = null;
    this.successMessage = null;
    
    this.demandeService.liberer(
      this.selectedDemandeForLiberation.id!, 
      this.liberationComment
    ).subscribe({
      next: (response) => {
        console.log('Demande libérée avec succès:', response);
        
        const index = this.demandes.findIndex(d => d.id === this.selectedDemandeForLiberation!.id);
        if (index !== -1) {
          this.demandes[index] = { ...this.demandes[index], estLiberer: true };
        }
        
        this.applyFilters();
        this.closeLiberationModal();
        this.isLiberating = false;
        
        this.successMessage = `La demande de ${this.selectedDemandeForLiberation!.employe?.prenom} ${this.selectedDemandeForLiberation!.employe?.nom} a été libérée avec succès.`;
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
    this.selectedStatut = 'all'; // Peut-être 'VALIDEE' si vous voulez qu'il revienne à la vue par défaut
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
    // Assurez-vous que le format de l'heure est correct, ici on prend les 5 premiers caractères (HH:MM)
    return timeString.substring(0, 5);
  }

  safeFormatDate(date?: string | Date | null): string {
    return date ? formatDate(date, 'dd/MM/yyyy', 'fr-FR') : '-';
  }
}