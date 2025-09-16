export type StatutDemande = 'EN_COURS' | 'VALIDEE' | 'REFUSEE'  | string;
export const STATUT_LABELS: Record<StatutDemande, string> = {
  EN_COURS: 'En cours',
  VALIDEE: 'Validée',
  REFUSEE: 'Refusée',
};
