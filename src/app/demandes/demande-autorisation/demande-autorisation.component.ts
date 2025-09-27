import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DemandeService } from '../../services/demande/demande.service';
import { TYPE_AUTORISATION, TYPE_DEMANDE_LABELS, TypeDemande } from '../../models/TypeDemande.model';
import { AutorisationRequest } from '../../models/AutorisationRequest.model';
import { PopupComponent } from '../../shared/popup/popup.component';

@Component({
  selector: 'app-demande-autorisation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopupComponent],
  templateUrl: './demande-autorisation.component.html',
  styleUrls: ['./demande-autorisation.component.css']
})
export class DemandeAutorisationComponent implements OnInit {
  congeForm: FormGroup;
  showPopup = false;
  popupTitle = '';
  popupMessage = '';
  popupIsSuccess = false;
  popupRedirectPath: string | null = null;
  showCancelButton = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  typesAutorisation = TYPE_AUTORISATION.map(t => ({
    value: t,
    label: TYPE_DEMANDE_LABELS[t]
  }));

  constructor(private demandeService: DemandeService, private fb: FormBuilder) {
    this.congeForm = this.fb.group({
      typeDemande: ['', Validators.required],
      dateAutorisation: ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin: ['', Validators.required],
      dateReelle: [''],
      heureSortieReelle: [''],
      heureRetourReel: ['']
    });
  }

  ngOnInit(): void {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = this.pad2(now.getMonth() + 1);
    const dd = this.pad2(now.getDate());
    const hh = this.pad2(now.getHours());
    const min = this.pad2(now.getMinutes());

    this.congeForm.patchValue({
      dateAutorisation: `${yyyy}-${mm}-${dd}`,
      heureDebut: `${hh}:${min}`,
      heureFin: `${this.pad2(now.getHours() + 1)}:${min}`
    });
  }

  private parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.congeForm.invalid) {
      this.errorMessage = 'Veuillez renseigner tous les champs obligatoires correctement.';
      this.congeForm.markAllAsTouched();
      this.showErrorPopup('Erreur', this.errorMessage, null, true);
      return;
    }

    const formValue = this.congeForm.value;
    const anyReal = !!(formValue.dateReelle || formValue.heureSortieReelle || formValue.heureRetourReel);
    if (anyReal && (!formValue.dateReelle || !formValue.heureSortieReelle || !formValue.heureRetourReel)) {
      this.errorMessage = 'Si vous renseignez le réel, fournissez la date réelle, l’heure de sortie réelle et l’heure de retour réelle.';
      this.congeForm.markAllAsTouched();
      this.showErrorPopup('Erreur', this.errorMessage, null, true);
      return;
    }

    // Validate duration (max 2 hours = 120 minutes)
    const debutMinutes = this.parseTimeToMinutes(formValue.heureDebut);
    const finMinutes = this.parseTimeToMinutes(formValue.heureFin);
    if (debutMinutes >= finMinutes) {
      this.errorMessage = 'L’heure de début doit être inférieure à l’heure de fin.';
      this.showErrorPopup('Erreur', this.errorMessage, null, true);
      return;
    }
    const durationMinutes = finMinutes - debutMinutes;
    if (durationMinutes > 120) {
      this.errorMessage = 'La durée de l’autorisation ne doit pas dépasser 2 heures (120 minutes).';
      this.showErrorPopup('Erreur', this.errorMessage, null, true);
      return;
    }

    // Validate real times if provided
    if (anyReal && formValue.heureSortieReelle && formValue.heureRetourReel) {
      const realDebutMinutes = this.parseTimeToMinutes(formValue.heureSortieReelle);
      const realFinMinutes = this.parseTimeToMinutes(formValue.heureRetourReel);
      if (realDebutMinutes >= realFinMinutes) {
        this.errorMessage = 'L’heure de sortie réelle doit être inférieure à l’heure de retour réelle.';
        this.showErrorPopup('Erreur', this.errorMessage, null, true);
        return;
      }
      const realDurationMinutes = realFinMinutes - realDebutMinutes;
      if (realDurationMinutes > 120) {
        this.errorMessage = 'La durée réelle de l’autorisation ne doit pas dépasser 2 heures (120 minutes).';
        this.showErrorPopup('Erreur', this.errorMessage, null, true);
        return;
      }
    }

    const body: AutorisationRequest = {
      typeDemande: formValue.typeDemande as TypeDemande,
      dateAutorisation: this.toDDMMYYYY(formValue.dateAutorisation),
      heureDebut: formValue.heureDebut,
      heureFin: formValue.heureFin,
      ...(anyReal ? {
        dateReelle: this.toDDMMYYYY(formValue.dateReelle),
        heureSortieReelle: formValue.heureSortieReelle,
        heureRetourReel: formValue.heureRetourReel
      } : {})
    };

    this.demandeService.createAutorisation(body).subscribe({
      next: () => {
        this.successMessage = 'Demande d’autorisation envoyée avec succès !';
        this.showSuccessPopup('Succès', this.successMessage, null, false);
        this.resetForm();
      },
      error: (err: any) => {
        let errorMessage = 'Erreur lors de l’envoi de la demande d’autorisation.';
        if (err.status === 400) {
          errorMessage = err.error || 'La durée de l’autorisation ne doit pas dépasser 2 heures (120 minutes) ou solde insuffisant.';
        } else if (err.status === 401) {
          errorMessage = 'Utilisateur non authentifié. Veuillez vous reconnecter.';
        }
        this.errorMessage = errorMessage;
        this.showErrorPopup('Erreur', errorMessage, null, true);
      }
    });
  }

  private toDDMMYYYY(yyyyMMdd: string): string {
    if (!yyyyMMdd) return '';
    const [y, m, d] = yyyyMMdd.split('-');
    return `${d}/${m}/${y}`;
  }

  private pad2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  private resetForm(): void {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = this.pad2(now.getMonth() + 1);
    const dd = this.pad2(now.getDate());
    const hh = this.pad2(now.getHours());
    const min = this.pad2(now.getMinutes());

    this.congeForm.reset({
      typeDemande: '',
      dateAutorisation: `${yyyy}-${mm}-${dd}`,
      heureDebut: `${hh}:${min}`,
      heureFin: `${this.pad2(now.getHours() + 1)}:${min}`,
      dateReelle: '',
      heureSortieReelle: '',
      heureRetourReel: ''
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