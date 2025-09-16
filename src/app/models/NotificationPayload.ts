
export interface NotificationPayload {
  id: number;
  demandeId: number | null;
  type: 'DEMANDE_CREATED' | 'DEMANDE_VALIDATED' | 'DEMANDE_REFUSED' | 'DEMANDE_UPDATED';
  subject: string;
  message: string;
  statut: 'NON_LU' | 'LU';
  dateCreation: string;           // ISO
  dateValidation?: string | null; // ISO
  motifRefus?: string | null;

  categorie?: string | null;      // ex: CONGE_STANDARD, AUTORISATION, ORDRE_MISSION
  typeDemande?: string | null;    // ex: CONGE_ANNUEL, CONGE_SANS_SOLDE...
  periodeDebut?: string | null;   // ISO (date ou datetime)
  periodeFin?: string | null;     // ISO
  heureDebut?: string | null;     // "HH:mm" si pertinent (autorisation)
  heureFin?: string | null;

  auteurMatricule?: string | null;
  destinataire?: string | null;
}
