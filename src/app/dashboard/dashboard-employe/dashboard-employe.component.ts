// src/app/dashboard-employe/dashboard-employe.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importez vos services et modèles
import { EmployeService } from '../../services/employe/employe.service';
import { Employe } from '../../models/Employe.model';
import { SoldeService } from '../../services/solde/solde.service';
import { SoldeConge } from '../../models/SoldeConge.model';

@Component({
  selector: 'app-dashboard-employe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-employe.component.html',
  styleUrls: ['./dashboard-employe.component.css']
})
export class DashboardEmployeComponent implements OnInit {

  // Propriétés pour stocker les données de l'employé et le solde de congé
  employe: Employe | null = null;
  soldeConge: SoldeConge | null = null;

  // Remplacez 'Waad123' par la méthode de récupération du matricule
  private matriculeEmploye = 'Waad123';

  constructor(
    private employeService: EmployeService,
    private soldeService: SoldeService
  ) { }

  ngOnInit(): void {
    // Récupérer les informations de l'employé
    this.employeService.getEmployeByMatricule(this.matriculeEmploye).subscribe(
      (employe) => {
        this.employe = employe;
      },
      (error) => {
        console.error("Erreur lors de la récupération des informations de l'employé :", error);
      }
    );

    // Récupérer le solde de congé de l'employé
    this.soldeService.getSoldeActuel(this.matriculeEmploye).subscribe(
      (soldeConge) => {
        this.soldeConge = soldeConge;
      },
      (error) => {
        console.error("Erreur lors de la récupération du solde de congé :", error);
      }
    );
  }
}