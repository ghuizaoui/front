import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './demande-form.component.html',
  styleUrls: ['./demande-form.component.css'],
})
export class DemandeFormComponent {
  step = 1;

  // Phase 1
  typeDemande = '';
  dateDebut = '';
  dateFin = '';

  // Phase 2
  interimMatricule = '';
  pasDInterimChecked = false;

submitDemande() {
    console.log('>>> submitDemande appelé');
    console.log('>>> typeDemande =', this.typeDemande);
    console.log('>>> dateDebut =', this.dateDebut);
    console.log('>>> dateFin =', this.dateFin);
    this.step = 2;
  }
  

  onPasDInterimChange() {
    if (this.pasDInterimChecked) {
      this.interimMatricule = '';
    }
  }

  submitInterim() {
    if (this.pasDInterimChecked) {
      console.log("Pas d’intérim indiqué.");
    } else {
      console.log("Intérim Matricule :", this.interimMatricule);
    }
    alert("Phase intérim soumise !");
  }
}

