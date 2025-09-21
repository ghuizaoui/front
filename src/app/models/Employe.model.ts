
import {Role} from './Role.model';
import {TypeContrat} from './TypeContrat.model';
import {SoldeConge} from './SoldeConge.model';
import {Demande} from './Demande.model';

export interface Employe {
  id: number;
  matricule: string;
  motDePasse?: string; // rarement envoyé côté front
  nom: string;
  prenom: string;
  email: string;
  direction: string;
  service: string;
  grade: number;
  dateEmbauche: string; // ISO date string
  typeContrat?: TypeContrat;
  role: Role;
  premiereConnexion: boolean;
  demandes?: Demande[];
  soldesConges?: SoldeConge[];
  chef1: string;
  chef2: string;
  estBanni?:boolean;
}
