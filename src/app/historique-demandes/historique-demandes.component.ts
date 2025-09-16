// src/app/historique-demandes/historique-demandes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DemandeService } from '../services/demande/demande.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Demande } from '../models/Demande.model';

@Component({
  selector: 'app-historique-demandes',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './historique-demandes.component.html',
  styleUrls: ['./historique-demandes.component.css']
})
export class HistoriqueDemandesComponent implements OnInit {

  demandes: Demande[] | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  private matriculeEmploye = 'Waad123'

  constructor(private demandeService: DemandeService) { }

  ngOnInit(): void {
    this.isLoading = true; // Démarre l'état de chargement
    this.errorMessage = null; // Réinitialise le message d'erreur

    // L'appel au service ne prend plus de paramètre matricule
    this.demandeService.getHistoriqueDemandes().subscribe({
      next: (data: Demande[]) => {
        this.demandes = data;
        this.isLoading = false; // Le chargement est terminé
      },
      error: (error: any) => {
        console.error("Erreur lors de la récupération de l'historique des demandes :", error);
        this.errorMessage = "Impossible de charger les demandes. Veuillez vérifier la connexion au serveur.";
        this.isLoading = false; // Le chargement est terminé
        this.demandes = []; // Affiche un tableau vide pour éviter les erreurs
      }
    });
  }
}
