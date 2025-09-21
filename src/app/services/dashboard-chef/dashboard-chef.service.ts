import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// On définit les interfaces pour refléter le DashboardChefDTO et ses sous-objets
export interface VueEnsembleDemandes {
  totalDemandes: number;
  totalConges: number;
  totalAutorisations: number;
  totalOrdresMission: number;
  pourcentageConges: number;
  pourcentageAutorisations: number;
  pourcentageOrdresMission: number;
}

export interface RepartitionStatuts {
  enCours: number;
  validees: number;
  refusees: number;
  pourcentageEnCours: number;
  pourcentageValidees: number;
  pourcentageRefusees: number;
}

export interface EvolutionConges {
  mois: string;
  joursPris: number;
}

export interface JoursCongesPris {
  joursPris: number;
  soldeTotal: number;
  pourcentagePris: number;
  soldeRestant: number;
  evolutionParMois: EvolutionConges[];
}

export interface DemandesAccepteesService {
  service: string;
  direction: string;
  demandesAcceptees: number;
}

export interface SoldeEmploye {
  matricule: string;
  nom: string;
  prenom: string;
  solde: number;
  plusGrandSolde: boolean;
}

export interface DashboardChefDTO {
  vueEnsembleDemandes: VueEnsembleDemandes;
  repartitionStatuts: RepartitionStatuts;
  joursCongesPris: JoursCongesPris;
  demandesAccepteesServices: DemandesAccepteesService[];
  soldesEmployes: SoldeEmploye[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardChefService {
  private apiUrl = 'http://localhost:9091/api/dashboard/chef';

  constructor(private http: HttpClient) {}

  /**
   * Récupère le dashboard global du chef
   */
  getDashboardChef(dateDebut?: string, dateFin?: string): Observable<DashboardChefDTO> {
    let params = new HttpParams();
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);

    return this.http.get<DashboardChefDTO>(this.apiUrl, { params });
  }

  /**
   * Récupère la vue d'ensemble des demandes
   */
  getVueEnsembleDemandes(dateDebut?: string, dateFin?: string): Observable<VueEnsembleDemandes> {
    let params = new HttpParams();
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);

    return this.http.get<VueEnsembleDemandes>(`${this.apiUrl}/vue-ensemble`, { params });
  }

  /**
   * Récupère la répartition des statuts
   */
  getRepartitionStatuts(dateDebut?: string, dateFin?: string): Observable<RepartitionStatuts> {
    let params = new HttpParams();
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);

    return this.http.get<RepartitionStatuts>(`${this.apiUrl}/repartition-statuts`, { params });
  }

  /**
   * Récupère les jours de congés pris
   */
  getJoursCongesPris(dateDebut?: string, dateFin?: string): Observable<JoursCongesPris> {
    let params = new HttpParams();
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);

    return this.http.get<JoursCongesPris>(`${this.apiUrl}/conges`, { params });
  }

  /**
   * Récupère les demandes acceptées par service
   */
  getDemandesAcceptees(dateDebut?: string, dateFin?: string): Observable<DemandesAccepteesService[]> {
    let params = new HttpParams();
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);

    return this.http.get<DemandesAccepteesService[]>(`${this.apiUrl}/demandes-acceptees`, { params });
  }

  /**
   * Récupère les soldes des employés
   */
  getSoldesEmployes(): Observable<SoldeEmploye[]> {
    return this.http.get<SoldeEmploye[]>(`${this.apiUrl}/soldes-employes`);
  }
}
