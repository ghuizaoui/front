// src/app/services/employe/employe.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employe } from '../../models/Employe.model';

@Injectable({ providedIn: 'root' })
export class EmployeService {

  private apiUrl = 'http://localhost:9091/api/employes';

  constructor(private http: HttpClient) {}

  add(emp: Omit<Employe,
    'id'|'matricule'|'motDePasse'|'premiereConnexion'|'demandes'|'soldesConges'>)
    : Observable<Employe> {
      return this.http.post<Employe>(`${this.apiUrl}/add`, emp); // <- au lieu de /addEmploye
    }

  list(): Observable<Employe[]> {
    return this.http.get<Employe[]>(`${this.apiUrl}/all`);
  }

  getOne(matricule: string): Observable<Employe> {
    return this.http.get<Employe>(`${this.apiUrl}/by-matricule/${matricule}`);
  }

  update(matricule: string, patch: Partial<Employe>): Observable<Employe> {
    return this.http.put<Employe>(`${this.apiUrl}/update/${matricule}`, patch);
  }

  firstLoginChangePassword(matricule: string, newPwd: string): Observable<void> {
    const params = new HttpParams()
      .set('matricule', matricule)
      .set('nouveauMotDePasse', newPwd);

    return this.http.post<void>(`${this.apiUrl}/premiere-connexion`, null, { params });
  }

  getEmployeProfile(matricule: string): Observable<Employe> {
    return this.http.get<Employe>(`${this.apiUrl}/${matricule}`);
  }
  getEmployeByMatricule(matricule: string): Observable<Employe> {
    // L'URL devrait correspondre à votre endpoint back-end, par ex. /api/employes/{matricule}
    return this.http.get<Employe>(`${this.apiUrl}/${matricule}`);
}

banne(matricule: string): Observable<boolean> {
  return this.http.put<boolean>(`${this.apiUrl}/banne/${matricule}`, null);
}

unbanne(matricule: string): Observable<boolean> {
  return this.http.put<boolean>(`${this.apiUrl}/unbanne/${matricule}`, null);
}

estSuper(): Observable<boolean> {
  return this.http.get<boolean>(`${this.apiUrl}/estsuper`);
}


me():Observable<Employe>{
  return this.http.get<Employe>(`${this.apiUrl}/me`)
}


getChefs():Observable<Employe[]>{
  return this.http.get<Employe[]>(`${this.apiUrl}/get-chefs`)
}

}
