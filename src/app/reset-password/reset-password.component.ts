import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';
import {Router, RouterLink} from '@angular/router';
import { EmployeService } from '../services/employe/employe.service';
import { FirstLoginService } from '../services/Firstlogin/first-login.service';
import { CommonModule } from '@angular/common';
import {LoginResponse} from '../models/Auth.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  pwd1 = '';
  pwd2 = '';
  msg  = '';

  constructor(
    private firstLogin: FirstLoginService,
    private auth      : AuthService,
    private router    : Router
  ) {
    /* accès direct interdit */
    if (!this.firstLogin.matricule) this.router.navigate(['/']);
  }

  save(): void {
    if (!this.pwd1 || !this.pwd2) { this.msg = 'Champs requis'; return; }
    if (this.pwd1 !== this.pwd2)  { this.msg = 'Les mots de passe ne correspondent pas'; return; }

    this.auth.changePassword({
      matricule: this.firstLogin.matricule!,
      nouveauMotDePasse: this.pwd1
    }).subscribe({
      next: (body: LoginResponse) => {
        // On efface le matricule temporaire
        this.firstLogin.matricule = '';


        const role = body.role ?? localStorage.getItem('role') ?? '';
        switch (role) {
          case 'EMPLOYE':   this.router.navigate(['/dashboard-employe']);   break;
          case 'CHEF':      this.router.navigate(['/dashboard-chef']);      break;
          case 'DRH':       this.router.navigate(['/dashboard-drh']);       break;
          case 'CONCIERGE': this.router.navigate(['/dashboard-concierge']); break;
          default:          this.router.navigate(['/']);                     break;
        }
      },

      error: () => this.msg = 'Erreur réseau, réessayez'
    });
  }
}
