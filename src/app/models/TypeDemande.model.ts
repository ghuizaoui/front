export type TypeDemande =
  | 'CONGE_ANNUEL'
  | 'CONGE_REPOS_COMPENSATEUR'
  | 'CONGE_SANS_SOLDE'
  | 'CONGE_MATERNITE'
  | 'CONGE_PATERNITE'
  | 'CONGE_MARIAGE'
  | 'CONGE_NAISSANCE'
  | 'CONGE_DECES'
  | 'CONGE_CIRCONCISION'
  | 'CONGE_PELERINAGE'
  | 'AUTORISATION_SORTIE_PONCTUELLE'
  | 'AUTORISATION_ABSENCE_EXCEPTIONNELLE'
  | 'AUTORISATION_RETARD';

// Listes pratiques (optionnelles)
export const TYPE_CONGE_STANDARD: TypeDemande[] = [
  'CONGE_ANNUEL',
  'CONGE_REPOS_COMPENSATEUR',
  'CONGE_SANS_SOLDE',
];

export const TYPE_CONGE_EXCEPTIONNEL: TypeDemande[] = [
  'CONGE_MATERNITE',
  'CONGE_PATERNITE',
  'CONGE_MARIAGE',
  'CONGE_NAISSANCE',
  'CONGE_DECES',
  'CONGE_CIRCONCISION',
  'CONGE_PELERINAGE',
];

export const TYPE_AUTORISATION: TypeDemande[] = [
  'AUTORISATION_SORTIE_PONCTUELLE',
  'AUTORISATION_ABSENCE_EXCEPTIONNELLE',
  'AUTORISATION_RETARD',
];

// Libellés (optionnel)
export const TYPE_DEMANDE_LABELS: Record<TypeDemande, string> = {
  CONGE_ANNUEL: 'Congé annuel',
  CONGE_REPOS_COMPENSATEUR: 'Congé repos compensateur',
  CONGE_SANS_SOLDE: 'Congé sans solde',
  CONGE_MATERNITE: 'Congé maternité',
  CONGE_PATERNITE: 'Congé paternité',
  CONGE_MARIAGE: 'Congé mariage',
  CONGE_NAISSANCE: 'Congé naissance',
  CONGE_DECES: 'Congé décès',
  CONGE_CIRCONCISION: 'Congé circoncision',
  CONGE_PELERINAGE: 'Congé pèlerinage',
  AUTORISATION_SORTIE_PONCTUELLE: 'Autorisation de sortie ponctuelle',
  AUTORISATION_ABSENCE_EXCEPTIONNELLE: 'Autorisation d’absence exceptionnelle',
  AUTORISATION_RETARD: 'Autorisation de retard',
};
