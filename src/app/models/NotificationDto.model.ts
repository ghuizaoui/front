import { Employe } from './Employe.model';
import { Demande } from './Demande.model';
import { StatutNotification } from './StatutNotification.model';

export interface Notification {
  id: number;
  demande: Demande;
  destinataire: Employe;
  subject: string;         // correspond au back-end
  message: string;         // correspond au back-end
  statut: StatutNotification;
  dateCreation: string;    // correspond au LocalDateTime du back-end
}
