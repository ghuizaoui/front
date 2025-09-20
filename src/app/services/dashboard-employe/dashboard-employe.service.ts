import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/** =======================
 * DTOs Angular équivalents
 * =======================*/

// KPI global
export interface KPIData {
  totalConges: number;
  totalAutorisations: number;
  totalDemandes: number;
  // ajoute d’autres KPI si ton backend en fournit
}

// Demande récente
export interface DemandeRecente {
  id: number;
  categorie: string;
  typeDemande: string;
  statut: string;
  dateCreation: string;
  dateDebut: string;
  dateFin: string;
}

// Autorisation du jour (pour concierge)
export interface AutorisationAujourdhui {
  demandeId: number;
  employeNom: string;
  employePrenom: string;
  employeMatricule: string;
  heureDebut: string;
  heureFin: string;
  service: string;
}

// DTO principal renvoyé par le backend
export interface EmployeDashboardDTO {
  kpiData: KPIData;
  demandesRecentes: DemandeRecente[];
  statutDistribution: { [key: string]: number };     // Map<String, Long> côté Java
  categorieDistribution: { [key: string]: number }; // Map<String, Long> côté Java
  autorisationsAujourdhui: AutorisationAujourdhui[]; // Seulement pour concierge
}

/** =======================
 * Service Angular
 * =======================*/
@Injectable({
  providedIn: 'root'
})
export class DashboardEmployeService {
  private apiUrl = 'http://localhost:9091/api/employe-dashboard';

  constructor(private http: HttpClient) {}

  /**
   * Récupérer le dashboard d’un employé ou concierge
   */
  getDashboard(): Observable<EmployeDashboardDTO> {
    return this.http.get<EmployeDashboardDTO>(
      `${this.apiUrl}`
    );
  }

  /**
   * Récupérer les autorisations du jour (seulement pour rôle CONCIERGE)
   */
  getAutorisationsAujourdhui(): Observable<AutorisationAujourdhui[]> {
    return this.http.get<AutorisationAujourdhui[]>(
      `${this.apiUrl}/autorisations-aujourdhui`
    );
  }
}
