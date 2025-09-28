// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';

import { DashboardEmployeComponent } from './dashboard/dashboard-employe/dashboard-employe.component';
import { DashboardChefComponent }   from './dashboard/dashboard-chef/dashboard-chef.component';
import { DashboardDrhComponent }    from './dashboard/dashboard-drh/dashboard-drh.component';

import { DemandeCongeComponent }                 from './demandes/demande-conge/demande-conge.component';
import { DemandeCongeExceptionnelComponent }     from './demandes/demande-conge-exceptionnel/demande-conge-exceptionnel.component';
import { DemandeAutorisationComponent }          from './demandes/demande-autorisation/demande-autorisation.component';
import { OrdreMissionComponent }                 from './demandes/ordre-mission/ordre-mission.component';
import { DemandeFormComponent }                  from './demande-form/demande-form.component';

import { EmployeesComponent } from './employees/employees.component';

import { AuthGuard } from './auth/auth.guard';
import {LayoutComponent} from './shared/layout/layout.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import { HistoriqueDemandesComponent } from './historique-demandes/historique-demandes.component';
import {DrhDemandesComponent} from './drh-demandes/drh-demandes.component';
import {ChefDemandesComponent} from './chef-demandes/chef-demandes.component';
import { Component } from '@angular/core';
import { Calendar } from '@fullcalendar/core/index.js';
import { CalendarComponent } from './calendar/calendar.component';
import { AutorisationComponent } from './autorisation/autorisation.component';
import { DemandesEtSoldeComponent } from './demandes-et-solde/demandes-et-solde.component';
import { GererEmployesComponent } from './gerer-employes/gerer-employes.component';
import { HistoriqueDemandesChefComponent } from './historique-demandes-chef/historique-demandes-chef.component';
import { RoleGuard } from './auth/role.guard';
import { Role } from './models/Role.model';
export const routes: Routes = [
  // --- pages SANS shell (ex : login, reset-password) -----------------
  {
    path: '',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },

  // --- toutes les pages protégées RENDUES DANS le shell ---------------
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'dashboard-employe',
        loadComponent: () =>
          import('./dashboard/dashboard-employe/dashboard-employe.component').then(m => m.DashboardEmployeComponent),
           canActivateChild: [RoleGuard],
           data: { roles: [Role.EMPLOYE] }
      },
      {
        path: 'dashboard-drh',
        loadComponent: () =>
          import('./dashboard/dashboard-drh/dashboard-drh.component').then(m => m.DashboardDrhComponent),
        canActivateChild: [RoleGuard],
        data: { roles: [Role.DRH] }
      },
      {
        path: 'dashboard-chef',
        loadComponent: () =>
          import('./dashboard/dashboard-chef/dashboard-chef.component').then(m => m.DashboardChefComponent),
        canActivateChild: [RoleGuard],
        data: { roles: [Role.CHEF] }
      },
      {
        path: 'chef/demandes',
        loadComponent: () =>
          import('./chef-demandes/chef-demandes.component').then(m => m.ChefDemandesComponent),
        canActivateChild: [RoleGuard],
        data: { roles: [Role.CHEF] }
      },
      {
        path: 'drh/demandes',
        loadComponent: () =>
          import('./drh-demandes/drh-demandes.component').then(m => m.DrhDemandesComponent),
        canActivateChild: [RoleGuard],
        data: { roles: [Role.DRH] }
      },
      {
        path: 'demande-conge',
        loadComponent: () =>
          import('./demandes/demande-conge/demande-conge.component').then(m => m.DemandeCongeComponent),
        
      },
      {
        path: 'demande-conge-exceptionnel',
        loadComponent: () =>
          import('./demandes/demande-conge-exceptionnel/demande-conge-exceptionnel.component').then(m => m.DemandeCongeExceptionnelComponent),
      },
      {
        path: 'demande-autorisation',
        loadComponent: () =>
          import('./demandes/demande-autorisation/demande-autorisation.component').then(m => m.DemandeAutorisationComponent),
      },
      {
        path: 'ordre-mission',
        loadComponent: () =>
          import('./demandes/ordre-mission/ordre-mission.component').then(m => m.OrdreMissionComponent),
      },
      {
        path: 'demande-form',
        loadComponent: () =>
          import('./demande-form/demande-form.component').then(m => m.DemandeFormComponent),
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./employees/employees.component').then(m => m.EmployeesComponent),
        canActivateChild: [RoleGuard],
        data: { roles: [Role.DRH] }
      },
      {
        path: 'historique',
        loadComponent: () =>
          import('./historique-demandes/historique-demandes.component').then(m => m.HistoriqueDemandesComponent),
        canActivateChild: [RoleGuard],
        data: { roles: [Role.DRH] }
      },
      {
        path: 'historique-chef',
        loadComponent: () =>
          import('./historique-demandes-chef/historique-demandes-chef.component').then(m => m.HistoriqueDemandesChefComponent),
        canActivateChild: [RoleGuard],
        data: { roles: [Role.CHEF] }
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./calendar/calendar.component').then(m => m.CalendarComponent),
        canActivateChild: [RoleGuard],
        data: { roles: [Role.CHEF,Role.DRH] }
      },
      {
        path: 'autorisation',
        loadComponent: () =>
          import('./autorisation/autorisation.component').then(m => m.AutorisationComponent),
        canActivateChild: [RoleGuard],
        data: { roles: [Role.CONCIERGE] }
      },
      {
        path: 'demandes-et-solde',
        loadComponent: () =>
          import('./demandes-et-solde/demandes-et-solde.component').then(m => m.DemandesEtSoldeComponent),

      },
      {
        path: 'gerer-employes',
        loadComponent: () =>
          import('./gerer-employes/gerer-employes.component').then(m => m.GererEmployesComponent),
        canActivateChild: [RoleGuard],
        data: { roles: [Role.DRH] }
      },
    ],
  },

  { path: '**', redirectTo: '' },
];