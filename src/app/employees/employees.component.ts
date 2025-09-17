import { Component, OnInit } from '@angular/core';
import { Employe } from '../models/Employe.model';
import { EmployeService } from '../services/employe/employe.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { PopupComponent } from "../shared/popup/popup.component";

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    NgClass,
    NgForOf,
    NgIf,
    PopupComponent
  ],
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {

  employees: Employe[] = [];       // liste complète
filterEmploye: Employe[] = [];   // liste filtrée
query:string='';
  loading = false;


  editing: boolean = false;
  selected: Partial<Employe> = {};

  employeeForm!: FormGroup;

  // popup vars
  showPopup = false;
  popupTitle = '';
  popupMessage = '';
  popupIsSuccess = false;
  popupRedirectPath: string | null = null;
  showCancelButton = false;





  constructor(
    private employeService: EmployeService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.fetchAll();

    this.employeeForm = this.fb.group({
      nom: ['', [Validators.required,Validators.minLength(3)]],
      prenom: ['', [Validators.required,Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      direction: [''],
      service: [''],
      grade: [''],
      dateEmbauche: [''],
      typeContrat: ['']
    });
  }

  fetchAll() {
    this.loading = true;
    this.employeService.list().subscribe({
      next: (emps) => { this.employees = emps; this.loading = false;
        this.filterEmploye = [...this.employees];
       },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    const q = this.query.toLowerCase().trim();
  
    if (!q) {
      this.filterEmploye = [...this.employees]; // reset si vide
      return;
    }
  
    this.filterEmploye = this.employees.filter(emp =>
      Object.values(emp).some(val =>
        String(val).toLowerCase().includes(q)
      )
    );
  }

  openAddModal() {
    this.editing = false;
    this.employeeForm.reset();
    (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('addEmployee')).show();
  }

  openEditModal(emp: Employe) {
    this.editing = true;
    this.employeeForm.patchValue(emp);
    (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('addEmployee')).show();
  }

  saveEmployee() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const empData = this.employeeForm.value;

    if (this.editing && empData.matricule) {
      this.employeService.update(empData.matricule, empData).subscribe(() => {
        this.fetchAll();
        (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('addEmployee')).hide();
      });
    } else {
      this.employeService.add(empData).subscribe({
        next: () => {
          this.fetchAll();
          (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('addEmployee')).hide();
        },
        error: () => {
          this.showErrorPopup("Failed to add employee", "Please check the fields or server", null, true);
        }
      });
    }
  }

  showErrorPopup(title: string, message: string, path: string | null, showCancelButton: boolean) {
    this.popupTitle = title;
    this.popupMessage = message;
    this.popupIsSuccess = false;
    this.popupRedirectPath = path;
    this.showCancelButton = showCancelButton;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }
}
