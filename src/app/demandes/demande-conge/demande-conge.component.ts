import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DemandeService } from '../../services/demande/demande.service';
import { CongeRequest } from '../../models/CongeRequest.model';
import { TypeDemande } from '../../models/TypeDemande.model';
import { PopupComponent } from "../../shared/popup/popup.component";

@Component({
  selector: 'app-demande-conge',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopupComponent],
  templateUrl: './demande-conge.component.html',
  styleUrls: ['./demande-conge.component.css']
})
export class DemandeCongeComponent implements OnInit {
  congeForm: FormGroup;
  showPopup = false;
  popupTitle = '';
  popupMessage = '';
  popupIsSuccess = false;
  popupRedirectPath: string | null = null;
  showCancelButton = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  typesConge = [
    { value: 'CONGE_ANNUEL', label: 'Congé annuel' },
  ];

  constructor(private demandeService: DemandeService, private fb: FormBuilder) {
    this.congeForm = this.fb.group({
      typeDemande: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      heureDebut: [''],
      heureFin: [''],
      interimaireMatricule: [''],
      pasDInterim: [false],
      validationManuelleDRH: [false]
    });
  }

  ngOnInit(): void {}

 // Convertir une date en nombre (timestamp) pour comparaison
private parseDateToNumber(date: string): number {
  const [day, month, year] = date.split('/').map(Number);
  return new Date(year, month - 1, day).getTime();
}

// Convertir une heure en minutes
private parseTimeToMinutes(time: string): number {
  if (!time) return -1; // sécuriser si vide
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

onSubmit(): void {
  this.errorMessage = null;
  this.successMessage = null;

  if (this.congeForm.invalid) {
    this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement.';
    this.congeForm.markAllAsTouched();
    return;
  }

  const formValue = this.congeForm.value;
  const body: CongeRequest = {
    typeDemande: formValue.typeDemande as TypeDemande,
    dateDebut: this.toDDMMYYYY(formValue.dateDebut),
    dateFin: this.toDDMMYYYY(formValue.dateFin),
    heureDebut: formValue.heureDebut || undefined,
    heureFin: formValue.heureFin || undefined,
  };

  //  Validation des dates
  const debutDateNum = this.parseDateToNumber(body.dateDebut);
  const finDateNum = this.parseDateToNumber(body.dateFin);

  if (debutDateNum > finDateNum) {
    this.showErrorPopup('Erreur', 'La date de début doit être antérieure ou égale à la date de fin.', null, true);
    return;
  }

  //  Validation des heures (uniquement si même jour)
  if (debutDateNum === finDateNum && body.heureDebut && body.heureFin) {
    const debutMinutes = this.parseTimeToMinutes(body.heureDebut);
    const finMinutes = this.parseTimeToMinutes(body.heureFin);

    if (debutMinutes >= finMinutes) {
      this.showErrorPopup('Erreur', 'L’heure de début doit être inférieure à l’heure de fin.', null, true);
      return;
    }
  }

  // Envoi API si tout est bon
  this.demandeService.createCongeStandard(body).subscribe({
    next: () => {
      this.successMessage = 'Demande de congé soumise avec succès !';
      this.showSuccessPopup('Succès', this.successMessage, null, false);
      this.resetForm();
    },
    error: (err: any) => {
      if (err.status === 400) {
        this.showErrorPopup('Erreur', 'Solde insuffisant.', null, true);
      } else {
        this.errorMessage = err?.error?.message || err?.message || 'Erreur lors de l’envoi.';
        this.showErrorPopup('Erreur', 'Erreur lors de l’envoi.', null, true);
      }
    }
  });
}


  private toDDMMYYYY(yyyyMMdd: string): string {
    if (!yyyyMMdd) return '';
    const [y, m, d] = yyyyMMdd.split('-');
    return `${d}/${m}/${y}`;
  }

  private resetForm(): void {
    this.congeForm.reset({
      typeDemande: '',
      dateDebut: '',
      dateFin: '',
      heureDebut: '',
      heureFin: '',
      interimaireMatricule: '',
      pasDInterim: false,
      validationManuelleDRH: false
    });
  }

  showSuccessPopup(title: string, message: string, path: string | null, showCancelButton: boolean): void {
    this.popupTitle = title;
    this.popupMessage = message;
    this.popupIsSuccess = true;
    this.popupRedirectPath = path;
    this.showCancelButton = showCancelButton;
    this.showPopup = true;
  }

  showErrorPopup(title: string, errorMessage: string, path: string | null, showCancelButton: boolean): void {
    console.log('show error popup activated');
    this.popupTitle = title;
    this.popupMessage = errorMessage;
    this.popupIsSuccess = false;
    this.popupRedirectPath = path;
    this.showCancelButton = showCancelButton;
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
  }
}