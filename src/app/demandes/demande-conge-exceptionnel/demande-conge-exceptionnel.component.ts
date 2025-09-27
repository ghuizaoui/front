import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DemandeService } from '../../services/demande/demande.service';
import { CongeExceptionnelRequest } from '../../models/CongeExceptionnelRequest';
import { TYPE_CONGE_EXCEPTIONNEL, TypeDemande, TYPE_DEMANDE_LABELS } from '../../models/TypeDemande.model';
import { PopupComponent } from '../../shared/popup/popup.component';

@Component({
  selector: 'app-demande-conge-exceptionnel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopupComponent],
  templateUrl: './demande-conge-exceptionnel.component.html',
  styleUrls: ['./demande-conge-exceptionnel.component.css']
})
export class DemandeCongeExceptionnelComponent implements OnInit {
  congeForm: FormGroup;
  showPopup = false;
  popupTitle = '';
  popupMessage = '';
  popupIsSuccess = false;
  popupRedirectPath: string | null = null;
  showCancelButton = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  selectedFile: File | null = null; // Store the selected file

  typesConge = TYPE_CONGE_EXCEPTIONNEL.map(type => ({
    value: type,
    label: TYPE_DEMANDE_LABELS[type]
  }));

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

  // Handle file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Seuls les fichiers PDF, JPEG et PNG sont autorisés.';
        this.selectedFile = null;
        input.value = ''; // Clear the input
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage = 'Le fichier dépasse la taille maximale de 10 Mo.';
        this.selectedFile = null;
        input.value = '';
        return;
      }
      this.errorMessage = null;
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.congeForm.invalid) {
      this.errorMessage = 'Veuillez renseigner tous les champs obligatoires correctement.';
      this.congeForm.markAllAsTouched();
      return;
    }

    const formValue = this.congeForm.value;
    const body: CongeExceptionnelRequest = {
      typeDemande: formValue.typeDemande as TypeDemande,
      dateDebut: this.toYYYYMMDD(formValue.dateDebut), // Adjusted to match backend format
      dateFin: this.toYYYYMMDD(formValue.dateFin),
      heureDebut: formValue.heureDebut || undefined,
      heureFin: formValue.heureFin || undefined
    };

    this.demandeService.createCongeExceptionnel(body, this.selectedFile).subscribe({
      next: () => {
        this.successMessage = 'Demande de congé exceptionnel envoyée avec succès !';
        this.showSuccessPopup('Succès', this.successMessage, null, false);
        this.resetForm();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || err?.message || 'Erreur lors de l’envoi.';
        this.showErrorPopup('Erreur', 'Erreur lors de l’envoi.', null, true);
      }
    });
  }

  // Convert date to YYYY-MM-DD format for backend compatibility
  private toYYYYMMDD(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${y}-${m}-${d}`; // Ensure format matches backend expectation
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
    this.selectedFile = null; // Clear the selected file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = ''; // Clear the file input
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