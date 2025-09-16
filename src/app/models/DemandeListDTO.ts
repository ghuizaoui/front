import { CategorieDemande } from './Categoriedemande.model';
import { StatutDemande } from './StatutDemande.model';
import { TypeDemande } from './TypeDemande.model';

export interface DemandeListDTO {
  id: number;

  employeMatricule: string | null;
  employeNom: string | null;
  employePrenom: string | null;

  categorie: CategorieDemande;
  typeDemande: TypeDemande | null;

  dateDebut: string | null;
  dateFin: string | null;

  statut: StatutDemande;
  dateCreation: string | null;
}
