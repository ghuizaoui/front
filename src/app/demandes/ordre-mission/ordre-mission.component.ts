import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemandeService } from '../../services/demande/demande.service';
import { OrdreMissionRequest } from '../../models/OrdreMissionRequest.model';

@Component({
  selector: 'app-ordre-mission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordre-mission.component.html',
  styleUrls: ['./ordre-mission.component.css']
})
export class OrdreMissionComponent {

  @ViewChild('dateDebut') dateDebutRef!: ElementRef<HTMLInputElement>;
  @ViewChild('heureDebut') heureDebutRef!: ElementRef<HTMLInputElement>;
  @ViewChild('dateFin')   dateFinRef!: ElementRef<HTMLInputElement>;
  @ViewChild('heureFin')  heureFinRef!: ElementRef<HTMLInputElement>;
  @ViewChild('objetMission') objetMissionRef!: ElementRef<HTMLTextAreaElement>;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private demandeService: DemandeService) {}

  onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage = null;
    this.successMessage = null;

    const dateDebut = this.dateDebutRef.nativeElement.value; // yyyy-MM-dd
    const heureDebut = this.heureDebutRef.nativeElement.value; // HH:mm
    const dateFin   = this.dateFinRef.nativeElement.value;     // yyyy-MM-dd
    const heureFin  = this.heureFinRef.nativeElement.value;    // HH:mm
    const missionObjet = this.objetMissionRef.nativeElement.value?.trim();

    if (!dateDebut || !heureDebut || !dateFin || !heureFin || !missionObjet) {
      this.errorMessage = 'Tous les champs sont obligatoires.';
      return;
    }

    // Validation simple : début <= fin
    const start = new Date(`${dateDebut}T${heureDebut}:00`);
    const end   = new Date(`${dateFin}T${heureFin}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      this.errorMessage = 'La date/heure de début doit être antérieure ou égale à la date/heure de fin.';
      return;
    }

    const body: OrdreMissionRequest = {
      dateDebut: this.toDDMMYYYY(dateDebut),
      heureDebut,
      dateFin:   this.toDDMMYYYY(dateFin),
      heureFin,
      missionObjet
    };

    this.demandeService.createOrdreMission(body).subscribe({
      next: () => {
        this.successMessage = 'Ordre de mission envoyé avec succès !';
        this.resetForm();
      },
      error: (err: any) => {
        this.errorMessage = (err?.error?.message || err?.message) ?? 'Erreur lors de l’envoi.';
      }
    });
  }

  private toDDMMYYYY(yyyyMMdd: string): string {
    const [y, m, d] = yyyyMMdd.split('-');
    return `${d}/${m}/${y}`;
  }

  private resetForm(): void {
    this.dateDebutRef.nativeElement.value = '';
    this.heureDebutRef.nativeElement.value = '';
    this.dateFinRef.nativeElement.value = '';
    this.heureFinRef.nativeElement.value = '';
    this.objetMissionRef.nativeElement.value = '';
  }
}
