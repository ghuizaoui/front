import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CongeRequest } from '../../models/CongeRequest.model';
import { TYPE_CONGE_EXCEPTIONNEL, TypeDemande, TYPE_DEMANDE_LABELS } from '../../models/TypeDemande.model';
import {DemandeService} from '../../services/demande/demande.service';

@Component({
  selector: 'app-demande-conge-exceptionnel',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './demande-conge-exceptionnel.component.html',
  styleUrls: ['./demande-conge-exceptionnel.component.css']
})
export class DemandeCongeExceptionnelComponent implements OnInit {
  @ViewChild('typeConge') typeCongeRef!: ElementRef<HTMLSelectElement>;
  @ViewChild('dateDebut') dateDebutRef!: ElementRef<HTMLInputElement>;
  @ViewChild('dateFin') dateFinRef!: ElementRef<HTMLInputElement>;
  @ViewChild('heureDebut') heureDebutRef!: ElementRef<HTMLInputElement>;
  @ViewChild('heureFin') heureFinRef!: ElementRef<HTMLInputElement>;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  typesConge = TYPE_CONGE_EXCEPTIONNEL.map(type => ({
    value: type,
    label: TYPE_DEMANDE_LABELS[type]
  }));

  constructor(private demandeService: DemandeService) {}

  ngOnInit(): void {}

  onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage = null;
    this.successMessage = null;

    const typeCongeValeur = this.typeCongeRef.nativeElement.value as TypeDemande;
    const dateDebutValeur = this.dateDebutRef.nativeElement.value;
    const dateFinValeur = this.dateFinRef.nativeElement.value;
    const heureDebutValeur = this.heureDebutRef.nativeElement.value;
    const heureFinValeur = this.heureFinRef.nativeElement.value;

    if (!typeCongeValeur || !dateDebutValeur || !dateFinValeur) {
      this.errorMessage = 'Veuillez renseigner tous les champs obligatoires.';
      return;
    }

    const body: CongeRequest = {
      typeDemande: typeCongeValeur,
      dateDebut: this.toDDMMYYYY(dateDebutValeur),
      dateFin: this.toDDMMYYYY(dateFinValeur),
      heureDebut: heureDebutValeur || undefined,
      heureFin: heureFinValeur || undefined
    };

    this.demandeService.createCongeExceptionnel(body).subscribe({
      next: () => {
        this.successMessage = 'Demande de congé exceptionnel envoyée avec succès !';
        this.resetForm();
      },
      error: (err: unknown) => {
        const anyErr = err as any;
        this.errorMessage = (anyErr?.error?.message || anyErr?.message) ?? 'Erreur lors de l’envoi.';
      }
    });
  }

  private toDDMMYYYY(dateStr: string): string {
    const [y, m, d] = dateStr.split('-');
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
