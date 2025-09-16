import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemandeService } from '../../services/demande/demande.service';
import { TYPE_AUTORISATION, TYPE_DEMANDE_LABELS, TypeDemande } from '../../models/TypeDemande.model';
import { AutorisationRequest } from '../../models/AutorisationRequest.model';

@Component({
  selector: 'app-demande-autorisation',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './demande-autorisation.component.html',
  styleUrls: ['./demande-autorisation.component.css']
})
export class DemandeAutorisationComponent implements OnInit {
  @ViewChild('typeAutorisation') typeAutorisationRef!: ElementRef<HTMLSelectElement>;

  // PRÉVU
  @ViewChild('dateAutorisation') dateAutorisationRef!: ElementRef<HTMLInputElement>;
  @ViewChild('heureDebut') heureDebutRef!: ElementRef<HTMLInputElement>;
  @ViewChild('heureFin') heureFinRef!: ElementRef<HTMLInputElement>;

  // RÉEL (optionnel)
  @ViewChild('dateReelle') dateReelleRef!: ElementRef<HTMLInputElement>;
  @ViewChild('heureSortieReelle') heureSortieReelleRef!: ElementRef<HTMLInputElement>;
  @ViewChild('heureRetourReel') heureRetourReelRef!: ElementRef<HTMLInputElement>;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  typesAutorisation = TYPE_AUTORISATION.map(t => ({
    value: t,
    label: TYPE_DEMANDE_LABELS[t]
  }));

  constructor(private demandeService: DemandeService) {}

  ngOnInit(): void {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = this.pad2(now.getMonth() + 1);
    const dd = this.pad2(now.getDate());
    const hh = this.pad2(now.getHours());
    const min = this.pad2(now.getMinutes());

    setTimeout(() => {
      if (this.dateAutorisationRef) this.dateAutorisationRef.nativeElement.value = `${yyyy}-${mm}-${dd}`;
      if (this.heureDebutRef) this.heureDebutRef.nativeElement.value = `${hh}:${min}`;
      if (this.heureFinRef) this.heureFinRef.nativeElement.value = `${this.pad2(now.getHours() + 1)}:${min}`;
    }, 0);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage = null;
    this.successMessage = null;

    const typeAutorisation = this.typeAutorisationRef.nativeElement.value as TypeDemande | '';

    // PRÉVU (requis)
    const dateAutorisation = this.dateAutorisationRef.nativeElement.value; // yyyy-MM-dd
    const heureDebut = this.heureDebutRef.nativeElement.value;             // HH:mm
    const heureFin   = this.heureFinRef.nativeElement.value;               // HH:mm

    if (!typeAutorisation) {
      this.errorMessage = 'Veuillez sélectionner un type d’autorisation.';
      return;
    }
    if (!dateAutorisation || !heureDebut || !heureFin) {
      this.errorMessage = 'Veuillez renseigner le jour et les heures prévues.';
      return;
    }

    // RÉEL (optionnel)
    const dateReelle        = this.dateReelleRef?.nativeElement?.value ?? '';
    const heureSortieReelle = this.heureSortieReelleRef?.nativeElement?.value ?? '';
    const heureRetourReel   = this.heureRetourReelRef?.nativeElement?.value ?? '';

    // Si l’un des 3 réels est saisi, exiger les 3
    const anyReal = !!(dateReelle || heureSortieReelle || heureRetourReel);
    if (anyReal && (!dateReelle || !heureSortieReelle || !heureRetourReel)) {
      this.errorMessage = 'Si vous renseignez le réel, fournissez la date réelle, l’heure de sortie réelle et l’heure de retour réelle.';
      return;
    }

    // Construction du payload aligné backend
    const body: AutorisationRequest = {
      typeDemande: typeAutorisation,
      dateAutorisation: this.toDDMMYYYY(dateAutorisation),
      heureDebut,
      heureFin,
      ...(anyReal ? {
        dateReelle: this.toDDMMYYYY(dateReelle),
        heureSortieReelle,
        heureRetourReel
      } : {})
    };

    this.demandeService.createAutorisation(body).subscribe({
      next: () => {
        this.successMessage = 'Demande d’autorisation envoyée avec succès !';
        this.resetForm();
      },
      error: (err: any) => {
        this.errorMessage = (err?.error?.message || err?.message) ?? 'Erreur lors de l’envoi.';
      }
    });
  }

  private toDDMMYYYY(yyyyMMdd: string): string {
    if (!yyyyMMdd) return '';
    const [y, m, d] = yyyyMMdd.split('-');
    return `${d}/${m}/${y}`;
  }
  private pad2(n: number): string { return n < 10 ? `0${n}` : `${n}`; }

  private resetForm(): void {
    this.typeAutorisationRef.nativeElement.value = '';
    this.dateAutorisationRef.nativeElement.value = '';
    this.heureDebutRef.nativeElement.value = '';
    this.heureFinRef.nativeElement.value = '';
    if (this.dateReelleRef) this.dateReelleRef.nativeElement.value = '';
    if (this.heureSortieReelleRef) this.heureSortieReelleRef.nativeElement.value = '';
    if (this.heureRetourReelRef) this.heureRetourReelRef.nativeElement.value = '';
  }
}
