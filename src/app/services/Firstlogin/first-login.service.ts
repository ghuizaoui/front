// src/app/services/auth/first-login.service.ts
import { Injectable } from '@angular/core';

/**
 * Stocke en mémoire le matricule de l'utilisateur
 * qui doit définir son mot de passe à la première connexion.
 * ⚠️  Pas de persistance : disparaît si l'onglet est fermé/refraîchi.
 */
@Injectable({ providedIn: 'root' })
export class FirstLoginService {

  private _matricule: string | null = null;

  get matricule(): string | null { return this._matricule; }

  set matricule(value: string | null) { this._matricule = value; }

  clear(): void { this._matricule = null; }
}
