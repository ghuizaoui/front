// src/app/dashboard-drh/dashboard-drh.component.ts
import { Component, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/header/header.component';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from '../../shared/layout/layout.component';

// Importez le SoldeService pour l'utiliser
import { SoldeService } from '../../services/solde/solde.service';

@Component({
  selector: 'app-dashboard-drh',
  standalone: true,
  imports: [CommonModule, ], // Ajout d'autres modules pour la complétude
  templateUrl: './dashboard-drh.component.html',
  styleUrls: ['./dashboard-drh.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardDrhComponent implements OnInit {
  // Variable pour stocker le solde de congé
  soldeActuel: number | null = null;
  // Matricule de l'employé pour les tests. Vous devrez le remplacer par le matricule réel.
  matriculeEmploye = 'votreMatriculeDeTest';

  // Le constructeur doit maintenant injecter le SoldeService
  constructor(
    private renderer: Renderer2,
    private soldeService: SoldeService
  ) {}

  ngOnInit(): void {
    // Injecte les scripts DANS le DOM (une fois par component, ou dans le layout principal)
    this.loadScript('assets/libs/bootstrap/js/bootstrap.bundle.min.js');
    this.loadScript('assets/js/layout.js');
    this.loadScript('assets/js/app.js');
    // ...etc pour chaque script custom

    // Appelez la méthode pour récupérer les données du solde
    this.getSoldeData();
  }

  loadScript(src: string) {
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.async = false;
    this.renderer.appendChild(document.body, script);
  }

  getSoldeData(): void {
    // Utilisez la méthode getSoldeActuel de votre service
    this.soldeService.getSoldeActuel(this.matriculeEmploye).subscribe(
      (soldeConge) => {
        // La requête a réussi, vous pouvez accéder aux données
        this.soldeActuel = soldeConge.soldeActuel;
        console.log('Solde de congé récupéré avec succès:', this.soldeActuel);
      },
      (error) => {
        // Gérer les erreurs, par exemple si l'employé n'est pas trouvé
        console.error("Erreur lors de la récupération du solde de congé :", error);
      }
    );
  }
}