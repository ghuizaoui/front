import { CategorieDemande } from './Categoriedemande.model';
import { StatutDemande } from './StatutDemande.model';
import { TypeDemande } from './TypeDemande.model';

export interface DemandeDetailDTO {
  id: number;

  // Employé
  employeMatricule: string | null;
  employeNom: string | null;
  employePrenom: string | null;
  employeEmail: string | null;

  // Métadonnées
  categorie: CategorieDemande;
  typeDemande: TypeDemande | null;
  statut: StatutDemande;
  commentaireRefus: string | null;
  dateCreation: string | null;   // ISO date-time
  dateValidation: string | null; // ISO date-time

  // CONGÉS
  congeDateDebut: string | null;   // yyyy-MM-dd
  congeHeureDebut: string | null;  // HH:mm:ss
  congeDateFin: string | null;     // yyyy-MM-dd
  congeHeureFin: string | null;    // HH:mm:ss

  // AUTORISATION
  autoDate: string | null;                 // yyyy-MM-dd
  autoHeureDebut: string | null;           // HH:mm:ss
  autoHeureFin: string | null;             // HH:mm:ss
  autoDateReelle: string | null;           // yyyy-MM-dd
  autoHeureSortieReelle: string | null;    // HH:mm:ss
  autoHeureRetourReel: string | null;      // HH:mm:ss

  // ORDRE DE MISSION
  missionDateDebut: string | null; // yyyy-MM-dd
  missionHeureDebut: string | null;// HH:mm:ss
  missionDateFin: string | null;   // yyyy-MM-dd
  missionHeureFin: string | null;  // HH:mm:ss
  missionObjet: string | null;
}
