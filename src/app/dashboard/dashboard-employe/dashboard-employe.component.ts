// src/app/dashboard-employe/dashboard-employe.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importez vos services et modèles
import { EmployeService } from '../../services/employe/employe.service';
import { Employe } from '../../models/Employe.model';
import { SoldeService } from '../../services/solde/solde.service';
import { SoldeConge } from '../../models/SoldeConge.model';
import { WelcomeCardComponent } from "../../dashboard-components/welcome-card/welcome-card.component";

@Component({
  selector: 'app-dashboard-employe',
  standalone: true,
  imports: [CommonModule, WelcomeCardComponent],
  templateUrl: './dashboard-employe.component.html',
  styleUrls: ['./dashboard-employe.component.css']
})
export class DashboardEmployeComponent implements OnInit {

  ngOnInit(): void {
    
  }
}