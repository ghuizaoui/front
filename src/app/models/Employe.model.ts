import { Role } from './Role.model';
import { TypeContrat } from './TypeContrat.model';
import { SoldeConge } from './SoldeConge.model';
import { Demande } from './Demande.model';

export interface Employe {
  matricule: string;
  motDePasse?: string;
  nom: string;
  prenom: string;
  email: string;
  direction: string;
  service: string;
  grade: number;
  dateEmbauche: string;
  typeContrat: TypeContrat;
  role: Role;
  premiereConnexion: boolean;
  demandes?: Demande[];
  soldesConges?: SoldeConge[];
  chefHierarchique1Matricule?: string; // Updated from chef1
  chefHierarchique2Matricule?: string; // Updated from chef2
  estBanni?: boolean;
  chefLevel?: number;
  drhSuper?: boolean;
}