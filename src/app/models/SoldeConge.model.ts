import {Employe} from './Employe.model';

export interface SoldeConge {
  id: number;
  employe: Employe;
  annee: number;
  soldeAu2012: number;
  droitAnnuel: number;
  droitN: number;
  congesAcquisN: number;
  retardsN: number;
  autorisationsCummulees: number;
  soldeActuel: number;
  grade: string;
  retardsCumules: number;
}
