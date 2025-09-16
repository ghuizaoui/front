import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { DemandeService } from '../../services/demande/demande.service';
import { CongeRequest } from '../../models/CongeRequest.model';
import { TypeDemande } from '../../models/TypeDemande.model';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-demande-conge',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule], // <-- Ajout explicite
  templateUrl: './demande-conge.component.html',
  styleUrls: ['./demande-conge.component.css']
})
export class DemandeCongeComponent implements OnInit {
  @ViewChild('typeConge') typeCongeRef!: ElementRef<HTMLSelectElement>;
  @ViewChild('dateDebut') dateDebutRef!: ElementRef<HTMLInputElement>;
  @ViewChild('dateFin') dateFinRef!: ElementRef<HTMLInputElement>;
  @ViewChild('heureDebut') heureDebutRef!: ElementRef<HTMLInputElement>;
  @ViewChild('heureFin') heureFinRef!: ElementRef<HTMLInputElement>;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  typesConge = [
    { value: 'CONGE_ANNUEL',             label: 'Congé annuel' },
    { value: 'CONGE_REPOS_COMPENSATEUR', label: 'Congé repos compensateur' },
    { value: 'CONGE_SANS_SOLDE',         label: 'Congé sans solde' }
  ];

  constructor(private demandeService: DemandeService) {}
  ngOnInit(): void {}

  onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage = null;
    this.successMessage = null;

    const typeCongeValeur = this.typeCongeRef.nativeElement.value as TypeDemande;
    const dateDebutValeur = this.dateDebutRef.nativeElement.value;   // yyyy-MM-dd
    const dateFinValeur   = this.dateFinRef.nativeElement.value;     // yyyy-MM-dd
    const heureDebutValeur = this.heureDebutRef.nativeElement.value; // HH:mm
    const heureFinValeur   = this.heureFinRef.nativeElement.value;   // HH:mm

    if (!typeCongeValeur || !dateDebutValeur || !dateFinValeur) {
      this.errorMessage = 'Veuillez sélectionner un type et des dates.';
      return;
    }

    const body: CongeRequest = {
      typeDemande: typeCongeValeur,
      dateDebut: this.toDDMMYYYY(dateDebutValeur),
      dateFin:   this.toDDMMYYYY(dateFinValeur),
      heureDebut: heureDebutValeur || undefined,
      heureFin:   heureFinValeur   || undefined
    };

    this.demandeService.createCongeStandard(body).subscribe({
      next: () => {
        this.successMessage = 'Demande de congé soumise avec succès !';
        this.resetForm();
      },
      error: (err: unknown) => {
        const anyErr = err as any;
        this.errorMessage = (anyErr?.error?.message || anyErr?.message) ?? 'Erreur lors de l’envoi.';
      }
    });
  }

  private toDDMMYYYY(yyyyMMdd: string): string {
    const [y, m, d] = yyyyMMdd.split('-');
    return `${d}/${m}/${y}`;
  }

  private resetForm(): void {
    this.typeCongeRef.nativeElement.value = '';
    this.dateDebutRef.nativeElement.value = '';
    this.dateFinRef.nativeElement.value = '';
    this.heureDebutRef.nativeElement.value = '';
    this.heureFinRef.nativeElement.value = '';
  }
}
