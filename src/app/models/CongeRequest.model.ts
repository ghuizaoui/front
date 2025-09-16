// src/app/models/CongeRequest.model.ts


import {TypeDemande} from './TypeDemande.model';

export interface CongeRequest {
  typeDemande: TypeDemande; // ex: 'CONGE_ANNUEL'
  dateDebut: string;        // 'dd/MM/yyyy'
  heureDebut?: string;      // 'HH:mm' (optionnel)
  dateFin: string;          // 'dd/MM/yyyy'
  heureFin?: string;        // 'HH:mm' (optionnel)
}
