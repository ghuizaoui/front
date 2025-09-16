import {Demande} from './Demande.model';
import {Employe} from './Employe.model';


export interface HistoriqueDemande {
  id: number;
  demande: Demande;
  action: string;
  acteur: Employe;
  dateAction: string;
}
