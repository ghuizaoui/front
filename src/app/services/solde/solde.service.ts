import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SoldeConge } from '../../models/SoldeConge.model'; 
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SoldeService {
  private apiUrl = `${environment.apiUrl}/demandes/solde`; // Ou un endpoint dédié au solde

  constructor(private http: HttpClient) { }

  getSoldeActuel(matriculeEmploye: string): Observable<SoldeConge> { 
    return this.http.get<SoldeConge>(`${this.apiUrl}/${matriculeEmploye}`);
  }
}