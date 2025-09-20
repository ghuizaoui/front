import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, timer, switchMap, catchError, of, throwError } from 'rxjs';
import { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse } from '../../models/Auth.model';
import { Employe } from '../../models/Employe.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:9091/auth';
  private refreshInProgress = false;
  private currentUser$ = new BehaviorSubject<Employe | null>(null);
  private tokenRefreshTimer?: any;

  constructor(private http: HttpClient, private router: Router) {
    // Démarrer le timer de refresh automatique si l'utilisateur est déjà connecté
    if (this.isAuthenticated()) {
      this.startTokenRefreshTimer();
    }
  }

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, req).pipe(
      tap(res => {
        console.log('[LOGIN RES]', res, Object.keys(res));
        this.storeTokens(res);
        this.startTokenRefreshTimer();
      })
    );
  }

  refreshToken(req: RefreshTokenRequest): Observable<RefreshTokenResponse> {
    // Éviter les appels simultanés de refresh
    if (this.refreshInProgress) {
      return new Observable(observer => {
        const checkRefresh = () => {
          if (!this.refreshInProgress) {
            const token = this.getToken();
            if (token) {
              observer.next({ token });
              observer.complete();
            } else {
              observer.error(new Error('Token refresh failed'));
            }
          } else {
            setTimeout(checkRefresh, 100);
          }
        };
        checkRefresh();
      });
    }

    this.refreshInProgress = true;
    console.log('[REFRESH TOKEN] Starting refresh...');

    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh`, req).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.token);
        this.refreshInProgress = false;
        console.log('[REFRESH TOKEN] Success - New token stored');
      }),
      catchError(error => {
        this.refreshInProgress = false;
        console.error('[REFRESH TOKEN] Failed:', error);

        // En cas d'échec du refresh, déconnecter l'utilisateur
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private storeTokens(response: LoginResponse): void {
    localStorage.setItem('access_token', response.token);
    localStorage.setItem('refresh_token', response.refreshToken);
    localStorage.setItem('role', response.role ?? '');
    console.log('[TOKENS STORED]', {
      access: !!response.token,
      refresh: !!response.refreshToken,
      role: response.role
    });
  }

  getToken(): string | null {
    const t = localStorage.getItem('access_token');
    return t && t !== 'undefined' && t !== 'null' ? t : null;
  }

  getRefreshToken(): string | null {
    const r = localStorage.getItem('refresh_token');
    return r && r !== 'undefined' && r !== 'null' ? r : null;
  }

  logout(): void {
    // Nettoyer le timer de refresh
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = undefined;
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    this.currentUser$.next(null);
    this.refreshInProgress = false;

    console.log('[LOGOUT] Tokens cleared');

    // Rediriger vers la page de login
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Observable<Employe> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    return this.http.get<Employe>(`${this.apiUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(user => {
        this.currentUser$.next(user);
        console.log('[GET CURRENT USER] Success:', user.matricule);
      }),
      catchError(error => {
        console.error('[GET CURRENT USER] Error:', error);
        this.currentUser$.next(null);

        // Ne pas déconnecter automatiquement ici, laisser l'intercepteur gérer les erreurs 401
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    return !!(token && refreshToken);
  }

  getMatricule(): string | null {
    const user = this.currentUser$.value;
    console.log("this is the  get matricule form the  authservice "+user)
    return user?.matricule || null;

  
  }

  changePassword(payload: { matricule: string; nouveauMotDePasse: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/change-password`, payload).pipe(
      tap(res => {
        this.storeTokens(res);
        this.startTokenRefreshTimer();
      })
    );
  }

  // Méthode pour s'assurer que le token est valide avant une requête
  public ensureTokenValid(): Observable<string | null> {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (!token || !refreshToken) {
      return of(null);
    }

    try {
      // Décoder le token pour vérifier l'expiration
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = tokenPayload.exp * 1000; // Convertir en millisecondes
      const currentTime = Date.now();

      // Si le token expire dans les 2 prochaines minutes, le rafraîchir
      if (expiryTime - currentTime < (2 * 60 * 1000)) {
        console.log('[ENSURE TOKEN VALID] Token expires soon, refreshing...');
        return this.refreshToken({ refreshToken }).pipe(
          switchMap(() => of(this.getToken())),
          catchError(() => of(null))
        );
      }

      return of(token);
    } catch (error) {
      console.error('[ENSURE TOKEN VALID] Token decode error:', error);
      return of(null);
    }
  }

  // Timer automatique pour rafraîchir le token
  private startTokenRefreshTimer(): void {
    // Nettoyer le timer existant
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (!token || !refreshToken) return;

    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = tokenPayload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // Programmer le refresh 5 minutes avant l'expiration
      const refreshTime = Math.max(0, timeUntilExpiry - (5 * 60 * 1000));

      console.log('[REFRESH TIMER]', {
        currentTime: new Date(currentTime),
        expiryTime: new Date(expiryTime),
        refreshIn: Math.round(refreshTime / 1000 / 60) + ' minutes'
      });

      if (refreshTime > 0) {
        this.tokenRefreshTimer = setTimeout(() => {
          console.log('[AUTO REFRESH] Starting automatic token refresh...');
          this.refreshToken({ refreshToken }).subscribe({
            next: () => {
              console.log('[AUTO REFRESH] Success');
              this.startTokenRefreshTimer(); // Programmer le prochain refresh
            },
            error: (error) => {
              console.error('[AUTO REFRESH] Failed:', error);
              // En cas d'échec, l'utilisateur sera déconnecté par la méthode refreshToken
            }
          });
        }, refreshTime);
      } else {
        // Token déjà expiré ou sur le point d'expirer, rafraîchir immédiatement
        console.log('[AUTO REFRESH] Token expired/expiring, refreshing now...');
        this.refreshToken({ refreshToken }).subscribe({
          next: () => this.startTokenRefreshTimer(),
          error: () => this.logout()
        });
      }
    } catch (error) {
      console.error('[REFRESH TIMER] Token decode error:', error);
      this.logout();
    }
  }

  // Getter pour observer les changements d'utilisateur
  get currentUser(): Observable<Employe | null> {
    return this.currentUser$.asObservable();
  }

  // Getter pour la valeur actuelle de l'utilisateur
  get currentUserValue(): Employe | null {
    return this.currentUser$.value;
  }
}
