import { Component, OnInit } from '@angular/core';
import { Employe } from '../models/Employe.model';
import { EmployeService } from '../services/employe/employe.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { PopupComponent } from '../shared/popup/popup.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    NgClass,
    NgForOf,
    NgIf,
    PopupComponent
  ],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  employees: Employe[] = [];
  filterEmploye: Employe[] = [];
  chefs: Employe[] = [];
  query: string = '';
  loading = false;
  saving = false;
  editing: boolean = false;
  selected: Partial<Employe> = {};
  employeeForm!: FormGroup;

  // Popup variables
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
    this.fetchChefs();

    this.employeeForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      prenom: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      direction: ['', Validators.required],
      service: ['', Validators.required],
      grade: ['', Validators.required],
      dateEmbauche: [''],
      typeContrat: ['', Validators.required],
      chefLevel: [null],
      chefHierarchique1Matricule: [''],
      chefHierarchique2Matricule: ['']
    });

    // Listen to role changes to update chefLevel validation
    this.employeeForm.get('role')?.valueChanges.subscribe(role => {
      this.employeeForm.get('chefLevel')?.updateValueAndValidity();
    });
  }

  // Custom validator for chefLevel
  chefLevelValidator(control: any) {
    const role = this.employeeForm?.get('role')?.value;
    if (role === 'CHEF' && control.value !== 1 && control.value !== 2) {
      return { invalidChefLevel: true };
    }
    return null;
  }

  fetchAll() {
    this.loading = true;
    this.employeService.list().subscribe({
      next: (emps) => {
        this.employees = emps;
        this.filterEmploye = [...this.employees];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showErrorPopup('Error', 'Failed to fetch employees', null, true);
      }
    });
  }

  fetchChefs() {
    this.employeService.getChefs().subscribe({
      next: (chefs) => {
        this.chefs = chefs;
      },
      error: (err) => {
        console.error('Failed to fetch chefs:', err);
      }
    });
  }

  applyFilter(): void {
    const q = this.query.toLowerCase().trim();
    if (!q) {
      this.filterEmploye = [...this.employees];
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
    this.selected = {};
    (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('addEmployee')).show();
  }

  openEditModal(emp: Employe) {
    this.editing = true;
    this.selected = emp;
    this.employeeForm.patchValue({
      ...emp,
      chefLevel: emp.chefLevel || null,
      chefHierarchique1Matricule: emp.chefHierarchique1Matricule || '',
      chefHierarchique2Matricule: emp.chefHierarchique2Matricule || ''
    });
    (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('addEmployee')).show();
  }

  saveEmployee() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const empData = {
      ...this.employeeForm.value,
      matricule: this.editing ? this.selected.matricule : undefined
    };

    // Clean up empty chef selections
    if (!empData.chefHierarchique1Matricule) delete empData.chefHierarchique1Matricule;
    if (!empData.chefHierarchique2Matricule) delete empData.chefHierarchique2Matricule;

    if (this.editing && empData.matricule) {
      this.employeService.update(empData.matricule, empData).subscribe({
        next: () => {
          this.saving = false;
          this.fetchAll();
          (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('addEmployee')).hide();
          this.showPopupMessage('Success', 'Employee updated successfully', true);
        },
        error: (err) => {
          this.saving = false;
          this.showErrorPopup('Error', err.error?.message || 'Failed to update employee', null, true);
        }
      });
    } else {
      this.employeService.add(empData).subscribe({
        next: () => {
          this.saving = false;
          this.fetchAll();
          (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('addEmployee')).hide();
          this.showPopupMessage('Success', 'Employee added successfully', true);
        },
        error: (err) => {
          this.saving = false;
          this.showErrorPopup('Error', err.error?.message || 'Failed to add employee', null, true);
        }
      });
    }
  }

  showPopupMessage(title: string, message: string, isSuccess: boolean) {
    this.popupTitle = title;
    this.popupMessage = message;
    this.popupIsSuccess = isSuccess;
    this.popupRedirectPath = null;
    this.showCancelButton = false;
    this.showPopup = true;
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

  // Helper method to get chef display name
  getChefDisplayName(matricule: string): string {
    const chef = this.chefs.find(c => c.matricule === matricule);
    return chef ? `${chef.nom} ${chef.prenom} (${chef.matricule})` : matricule;
  }
}