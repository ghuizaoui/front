import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Demande } from '../models/Demande.model';
import { DemandeService } from '../services/demande/demande.service';
import { PopupComponent } from "../shared/popup/popup.component";

@Component({
  selector: 'app-autorisation',
  standalone: true,
  imports: [CommonModule, PopupComponent],
  templateUrl: './autorisation.component.html',
  styleUrls: ['./autorisation.component.css']
})
export class AutorisationComponent implements OnInit {
  autorisations: Demande[] = [];
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(private demandeService: DemandeService) {}

  ngOnInit(): void {
    this.loadAutorisations();
  }

  loadAutorisations(): void {
    this.isLoading = true;
    this.demandeService.getAllAutorisation().subscribe({
      next: (req) => {
        console.log("loading successfully");
        this.autorisations = req;
        console.log(this.autorisations);
        this.isLoading = false;
      },
      error: (err) => {
        console.log(err);
        this.errorMessage = 'Erreur lors du chargement des autorisations.';
        this.isLoading = false;
      }
    });
  }
}