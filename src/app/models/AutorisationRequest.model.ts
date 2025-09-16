import { TypeDemande } from './TypeDemande.model';

export interface AutorisationRequest {
  typeDemande: TypeDemande;   // 'AUTORISATION_*'

  // PRÉVU (requis)
  dateAutorisation: string;   // dd/MM/yyyy
  heureDebut: string;         // HH:mm
  heureFin: string;           // HH:mm

  // RÉEL (optionnel — si l’un est fourni, fournir les 3)
  dateReelle?: string;        // dd/MM/yyyy (souvent = dateAutorisation)
  heureSortieReelle?: string; // HH:mm
  heureRetourReel?: string;   // HH:mm
}
