// src/app/auth/role.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { Role } from '../models/Role.model';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivateChild {

  constructor(private authService: AuthService, private router: Router) {}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles: Role[] = route.data['roles']; // récupère les rôles autorisés depuis la route
    const user = this.authService.currentUserValue;

    if (!user) {
      this.router.navigate(['/']); // non connecté
      return false;
    }

    if (!expectedRoles.includes(user.role)) {
      this.router.navigate(['/']); // rôle non autorisé
      return false;
    }

    return true; // connecté et rôle autorisé
  }
}
