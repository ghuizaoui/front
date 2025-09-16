export type CategorieDemande = 'CONGE_STANDARD' | 'CONGE_EXCEPTIONNEL' | 'AUTORISATION' | 'ORDRE_MISSION' | string;
export const CATEGORIE_LABELS: Record<CategorieDemande, string> = {
  CONGE_STANDARD: 'Congé standard',
  CONGE_EXCEPTIONNEL: 'Congé exceptionnel',
  AUTORISATION: 'Autorisation',
  ORDRE_MISSION: 'Ordre de mission',
};
