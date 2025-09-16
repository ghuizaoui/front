// src/app/auth/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivateChild, Router,
  ActivatedRouteSnapshot, RouterStateSnapshot
} from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivateChild {

  constructor(private router: Router) {}

  canActivateChild(_r: ActivatedRouteSnapshot, _s: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('access_token');
    if (!token || token === 'undefined') { // 👈 protège
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }

}
