// src/app/services/demande/demande.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Demande } from '../../models/Demande.model';
import { CongeRequest } from '../../models/CongeRequest.model';
import { AutorisationRequest } from '../../models/AutorisationRequest.model';
import { OrdreMissionRequest } from '../../models/OrdreMissionRequest.model';
import {DemandeListDTO} from '../../models/DemandeListDTO';
import {DemandeDetailDTO} from '../../models/DemandeDetailDTO';
import { EmployeSoldeDto } from '../../models/EmployeSoldeDto';
import { CongeExceptionnelRequest } from '../../models/CongeExceptionnelRequest';

@Injectable({ providedIn: 'root' })
export class DemandeService {

  private apiUrl = 'http://localhost:8081/api/demandes';

  constructor(private http: HttpClient) {}

  createCongeStandard(body: CongeRequest): Observable<Demande> {
    return this.http.post<Demande>(`${this.apiUrl}/conge-standard`, body);
  }

  getAllDemandes(): Observable<Demande[]>{
    return this.http.get<Demande[]>(`${this.apiUrl}/get-all`)
  }
  /**
   * Ajouté pour supporter le composant DemandesToday et le rôle Concierge.
   * Récupère toutes les demandes ayant le statut 'VALIDEE'.
   * Cela assume l'existence d'un endpoint backend dédié pour cette fonction.
   */
  getAllValidatedDemandes(): Observable<Demande[]> {
    // Ceci est l'appel HTTP vers le nouvel endpoint du backend (à implémenter côté serveur)
    return this.http.get<Demande[]>(`${this.apiUrl}/get-all-validated`); 
  }



  getAllDemandesByService():Observable<Demande[]>{
    return this.http.get<Demande[]>(`${this.apiUrl}/get-all-v-r`)
  }

  createCongeExceptionnel(request: CongeExceptionnelRequest, file: File |null): Observable<Demande> {
    const formData = new FormData();
    
    // Append the JSON request data as a string
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    
    // Append the file if provided
    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.post<Demande>(`${this.apiUrl}/conge-exceptionnel`, formData);
  }

  createAutorisation(body: AutorisationRequest): Observable<Demande> {
    return this.http.post<Demande>(`${this.apiUrl}/autorisation`, body);
  }

  createOrdreMission(body: OrdreMissionRequest): Observable<Demande> {
    return this.http.post<Demande>(`${this.apiUrl}/ordre-mission`, body);
  }


  /**
   * Envoie une requête au backend pour valider une demande.
   * @param demandeId L'identifiant de la demande à valider.
   */
  validerDemande(demandeId: number): Observable<any> {
    const url = `${this.apiUrl}/validation/${demandeId}`;
    const body = { isValidee: true };
    return this.http.post(url, body);
  }

  /**
   * Envoie une requête au backend pour refuser une demande.
   * @param demandeId L'identifiant de la demande à refuser.
   * @param commentaire Le motif du refus.
   */
  refuserDemande(demandeId: number, commentaire: string): Observable<any> {
    const url = `${this.apiUrl}/validation/${demandeId}`;
    const body = {
      isValidee: false,
      commentaire: commentaire
    };
    return this.http.post(url, body);
  }

   
    /**
   * Récupère toutes les demandes en attente de validation pour le chef connecté.
   * L'API back-end utilise le contexte de sécurité pour identifier le chef.
   */
  getDemandesEnAttente(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.apiUrl}/demandes-en-attente`);
  }
   // 🔹 Récupérer l’historique des demandes des subordonnés d’un chef
   getHistoriqueSubordonnes(matriculeChef: string): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.apiUrl}/historique-subordonnes/${matriculeChef}`);
  }


  getDemandesForChef(): Observable<DemandeListDTO[]> {
    return this.http.get<DemandeListDTO[]>(`${this.apiUrl}/chef`);
  }

  /**
   * DRH : toutes les demandes des employés ayant le rôle CHEF.
   * (Aucun tri serveur, tous statuts confondus)
   */
  getDemandesForDrh(): Observable<DemandeListDTO[]> {
    return this.http.get<DemandeListDTO[]>(`${this.apiUrl}/drh`);
  }
  getDemandeDetail(demandeId: number): Observable<DemandeDetailDTO> {
    return this.http.get<DemandeDetailDTO>(`${this.apiUrl}/${demandeId}`);
  }

  valider(demandeId: number): Observable<Demande> {
    return this.http.post<Demande>(`${this.apiUrl}/${demandeId}/valider`, {});
  }

  /** Refuser (avec motif) */
  refuser(demandeId: number, commentaire: string): Observable<Demande> {
    return this.http.post<Demande>(`${this.apiUrl}/${demandeId}/refuser`, { commentaire });
  }





  //***************************** Dashboard  */

  /**
 * Récupère le nombre de demandes par catégorie.
 * Exemple retour JSON: [["CONGE_STANDARD", 12], ["AUTORISATION", 8]]
 */
getCountByCategorie(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/count/categorie`);
}

/**
 * Récupère le nombre de demandes par employé (matricule).
 * Exemple retour JSON: [["e1234", 6], ["e5678", 9]]
 */
getCountByEmploye(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/count/employe`);
}

/**
 * Récupère le nombre de demandes par service.
 * Exemple retour JSON: [["RH", 10], ["IT", 8]]
 */
getCountByService(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/count/service`);
}

/**
 * Récupère le temps moyen de validation (en secondes).
 * Exemple retour JSON: 125.5
 */
getAverageValidationTime(): Observable<number> {
  return this.http.get<number>(`${this.apiUrl}/average-validation-time`);
}



// -------------------- CHARTS / TIME SERIES --------------------
countDemandesPerMonth(start: string, end: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/chart/month?start=${start}&end=${end}`);
}

countDemandesPerMonthAndYear(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/chart/month-year`);
}

countDemandesByCategoriePerMonth(start: string, end: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/chart/category-month?start=${start}&end=${end}`);
}

countDemandesByType(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/chart/type`);
}

// -------------------- FILTERS / SEARCH --------------------
findByEmployeAndStatut(matricule: string, statut: string): Observable<Demande[]> {
  return this.http.get<Demande[]>(`${this.apiUrl}/filter/employe-statut?matricule=${matricule}&statut=${statut}`);
}

findByTypeDemande(typeDemande: string): Observable<Demande[]> {
  return this.http.get<Demande[]>(`${this.apiUrl}/filter/type?type=${typeDemande}`);
}

findByDateCreationBetween(start: string, end: string): Observable<Demande[]> {
  return this.http.get<Demande[]>(`${this.apiUrl}/filter/date-range?start=${start}&end=${end}`);
}

countByEmployeAndDateRange(matricule: string, start: string, end: string): Observable<number> {
  return this.http.get<number>(`${this.apiUrl}/filter/count-employe-date?matricule=${matricule}&start=${start}&end=${end}`);
}




//
getAllAutorisation():Observable<Demande[]>{
  return this.http.get<Demande[]>(`${this.apiUrl}/get-all-autorisation-order-mission`)
}


 /**
     * Récupère la liste complète des demandes soumises par l'employé connecté.
     */
 getHistoriqueDemandes(): Observable<Demande[]> {
  return this.http.get<Demande[]>(`${this.apiUrl}/historique`);
}


getEmployeSolde():Observable<EmployeSoldeDto>{
  return this.http.get<EmployeSoldeDto>(`${this.apiUrl}/get-employe-solde`)
}

cancelDemande(demandeId: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/cancel-demande/${demandeId}`);
}



downloadDemandeFile(demandeId: number, fileName?: string): Observable<Blob> {
  // Si aucun nom de fichier n'est fourni, on utilise un nom par défaut
  const defaultFileName = `demande_${demandeId}.pdf`;
  
  return this.http.get(`${this.apiUrl}/${demandeId}/download`, {
    responseType: 'blob' // Important pour récupérer un fichier binaire
  });
}

/**
 * Méthode utilitaire pour déclencher le téléchargement dans le navigateur
 */
downloadFile(demandeId: number, fileName?: string): void {
  this.downloadDemandeFile(demandeId, fileName).subscribe(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `demande_${demandeId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url); // Libère la mémoire
  }, error => {
    console.error('Erreur lors du téléchargement du fichier', error);
  });
}



getDemandesDG():Observable<Demande[]>{
  return this.http.get<Demande[]>(`${this.apiUrl}/get-dg-demandes`)
}


getDemandesToday():Observable<Demande[]>{
  return this.http.get<Demande[]>(`${this.apiUrl}/get-demandes-today`)
}



liberer(demandeId: number, commentaire: string): Observable<any> {
  const body = { demandeId, commentaire };
  return this.http.post<any>(`${this.apiUrl}/liberer`, body);
}


/**
 * Récupère toutes les demandes pour un service donné.
 * @param serviceName Le nom du service.
 */
getDemandesByService(serviceName: string): Observable<Demande[]> {
  return this.http.get<Demande[]>(`${this.apiUrl}/service/${serviceName}`);
}

}

