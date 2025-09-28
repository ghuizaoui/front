import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DemandeService } from '../../services/demande/demande.service';
import { OrdreMissionRequest } from '../../models/OrdreMissionRequest.model';
import { PopupComponent } from '../../shared/popup/popup.component';

@Component({
  selector: 'app-ordre-mission',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopupComponent],
  templateUrl: './ordre-mission.component.html',
  styleUrls: ['./ordre-mission.component.css']
})
export class OrdreMissionComponent implements OnInit {
  ordreMissionForm: FormGroup;
  showPopup = false;
  popupTitle = '';
  popupMessage = '';
  popupIsSuccess = false;
  popupRedirectPath: string | null = null;
  showCancelButton = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false; // Store the selected file

  constructor(private demandeService: DemandeService, private fb: FormBuilder) {
    this.ordreMissionForm = this.fb.group({
      dateDebut: ['', Validators.required],
      heureDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      heureFin: ['', Validators.required],
      objetMission: ['', [Validators.required, Validators.minLength(1)]]
    }, { validators: this.dateTimeValidator });
  }

  ngOnInit(): void {}

  // Custom validator to ensure start date/time is not later than end date/time
  dateTimeValidator(control: AbstractControl): ValidationErrors | null {
    const dateDebut = control.get('dateDebut')?.value;
    const heureDebut = control.get('heureDebut')?.value;
    const dateFin = control.get('dateFin')?.value;
    const heureFin = control.get('heureFin')?.value;

    if (!dateDebut || !heureDebut || !dateFin || !heureFin) {
      return null; // Let required validators handle empty fields
    }

    const start = new Date(`${dateDebut}T${heureDebut}:00`);
    const end = new Date(`${dateFin}T${heureFin}:00`);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return { invalidDateTime: true };
    }

    return null;
  }

  onSubmit(): void {
    this.loading=true
    this.errorMessage = null;
    this.successMessage = null;

    if (this.ordreMissionForm.invalid) {
      this.errorMessage = this.ordreMissionForm.errors?.['invalidDateTime']
        ? 'La date/heure de début doit être antérieure ou égale à la date/heure de fin.'
        : 'Tous les champs sont obligatoires.';
      this.ordreMissionForm.markAllAsTouched();
      this.showErrorPopup('Erreur', this.errorMessage, null, true);
      return;
    }

    const formValue = this.ordreMissionForm.value;
    const body: OrdreMissionRequest = {
      dateDebut: this.toDDMMYYYY(formValue.dateDebut),
      heureDebut: formValue.heureDebut,
      dateFin: this.toDDMMYYYY(formValue.dateFin),
      heureFin: formValue.heureFin,
      missionObjet: formValue.objetMission.trim()
    };

    this.demandeService.createOrdreMission(body).subscribe({
      next: () => {
        this.successMessage = 'Ordre de mission envoyé avec succès !';
        this.showSuccessPopup('Succès', this.successMessage, null, false);
        this.resetForm();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || err?.message || 'Erreur lors de l’envoi.';
        this.showErrorPopup('Erreur', 'Erreur lors de l’envoi.', null, true);
      },
      complete: () => {
        this.loading = false; // réactiver le bouton après réponse
      }
    });
  }

  private toDDMMYYYY(yyyyMMdd: string): string {
    if (!yyyyMMdd) return '';
    const [y, m, d] = yyyyMMdd.split('-');
    return `${d}/${m}/${y}`;
  }

  private resetForm(): void {
    this.ordreMissionForm.reset({
      dateDebut: '',
      heureDebut: '',
      dateFin: '',
      heureFin: '',
      objetMission: ''
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