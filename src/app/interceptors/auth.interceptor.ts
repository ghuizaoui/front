import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { AuthService } from '../services/auth/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Exclure les endpoints d'authentification pour éviter les boucles infinies
  const isAuthEndpoint = req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/change-password');

  if (isAuthEndpoint) {
    return next(req);
  }

  // S'assurer que le token est valide avant d'envoyer la requête
  return auth.ensureTokenValid().pipe(
    switchMap(token => {
      let authReq = req;

      // Ajouter le token d'autorisation s'il existe
      if (token) {
        authReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
      }

      return next(authReq);
    }),
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        // Vérifier que l'erreur vient de notre API
        const isOurApi = typeof err.url === 'string' &&
          err.url.startsWith('http://localhost:9091/');

        if (!isOurApi) {
          return throwError(() => err);
        }

        console.log('[INTERCEPTOR] 401 Error detected, attempting token refresh...');

        const refreshToken = auth.getRefreshToken();
        if (refreshToken) {
          return auth.refreshToken({ refreshToken }).pipe(
            switchMap((refreshRes) => {
              const newToken = refreshRes.token;
              console.log('[INTERCEPTOR] Token refreshed successfully, retrying request...');

              // Réessayer la requête originale avec le nouveau token
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next(retryReq);
            }),
            catchError(refreshError => {
              console.error('[INTERCEPTOR] Token refresh failed:', refreshError);
              // La méthode refreshToken() se charge déjà de déconnecter l'utilisateur
              return throwError(() => refreshError);
            })
          );
        } else {
          console.log('[INTERCEPTOR] No refresh token available, logging out...');
          auth.logout();
          return throwError(() => err);
        }
      }

      return throwError(() => err);
    })
  );
};
