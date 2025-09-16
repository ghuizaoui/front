import { CategorieDemande } from "./Categoriedemande.model";
import { Employe } from "./Employe.model";
import { StatutDemande } from "./StatutDemande.model";
import { TypeDemande } from "./TypeDemande.model";

export interface Demande {
  id: number;
  employe?: Employe;
  validateur?: Employe | null;

  statut: StatutDemande;
  categorie: CategorieDemande;
  typeDemande?: TypeDemande | null;

  // Dates/heures renvoyées par l'API (ISO ou selon config Jackson)
  dateCreation?: string;
  dateValidation?: string;

  // Champs métiers potentiels côté backend
  congeDateDebut?: string;
  congeDateFin?: string;
  congeHeureDebut?: string | null;
  congeHeureFin?: string | null;

  autoDateDebut?: string;
  autoHeureDebut?: string;
  autoDateFin?: string;
  autoHeureFin?: string;

  missionDateDebut?: string;
  missionHeureDebut?: string;
  missionDateFin?: string;
  missionHeureFin?: string;
  missionObjet?: string;

  commentaireRefus?: string | null;
  workflowId?: string;
}
