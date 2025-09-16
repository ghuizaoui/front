import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { EmployeService } from '../../services/employe/employe.service';
import { SoldeService } from '../../services/solde/solde.service';
import { DemandeService } from '../../services/demande/demande.service';
import { NotificationService } from '../../services/notification/notification.service';

import { Employe } from '../../models/Employe.model';
import { SoldeConge } from '../../models/SoldeConge.model';
import { Demande } from '../../models/Demande.model';

@Component({
  selector: 'app-dashboard-chef',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './dashboard-chef.component.html',
  styleUrls: ['./dashboard-chef.component.css']
})
export class DashboardChefComponent implements OnInit {

  matricule: string = '';
  employe: Employe | null = null;
  soldeConge: SoldeConge | null = null;
  demandesEnAttente: Demande[] = [];
  historiqueSubordonnes: Demande[] = [];
  unreadCount: number = 0;
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private employeService: EmployeService,
    private soldeService: SoldeService,
    private demandeService: DemandeService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void { }


  private loadChefData(matricule: string): void {
    // --- Demandes en attente ---
    this.demandeService.getDemandesEnAttente().subscribe({
      next: (demandes: Demande[]) => this.demandesEnAttente = demandes,
      error: (err) => console.error("Error fetching pending requests:", err)
    });

    // --- Historique des subordonnés ---
    this.demandeService.getHistoriqueSubordonnes(matricule).subscribe({
      next: (historique: Demande[]) => this.historiqueSubordonnes = historique,
      error: (err) => console.error("Error fetching subordinates' history:", err)
    });
  }
}
