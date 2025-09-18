export interface EmployeSoldeDto {
    nom: string;              // Nom de l’employé
    prenom: string;           // Prénom de l’employé
    grade: number;            // Grade ou niveau
    service: string;          // Service de l’employé
    annee: number;            // Année de référence du solde
  
    // Informations de solde
    soldeAu2012: number;      // Solde reporté au 2012
    droitAnnuel: number;      // Droit annuel
    droitN: number;           // Droit de l'année N
    congesAcquisN: number;    // Congés acquis année N
    retardsN: number;         // Retards année N
    autorisationsN: number;   // Autorisations année N
    soldeActuel: number;      // Solde actuel
  }
  