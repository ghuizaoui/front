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
  query: string = '';
  loading = false;
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

    this.employeeForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      prenom: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      direction: [''],
      service: [''],
      grade: [''],
      dateEmbauche: [''],
      typeContrat: [''],
      chefLevel: [null]
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
      chefLevel: emp.chefLevel || null
    });
    (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('addEmployee')).show();
  }

  saveEmployee() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const empData = {
      ...this.employeeForm.value,
      matricule: this.editing ? this.selected.matricule : undefined
    };

    if (this.editing && empData.matricule) {
      this.employeService.update(empData.matricule, empData).subscribe({
        next: () => {
          this.fetchAll();
          (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('addEmployee')).hide();
          this.showPopupMessage('Success', 'Employee updated successfully', true);
        },
        error: () => {
          this.showErrorPopup('Error', 'Failed to update employee', null, true);
        }
      });
    } else {
      this.employeService.add(empData).subscribe({
        next: () => {
          this.fetchAll();
          (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('addEmployee')).hide();
          this.showPopupMessage('Success', 'Employee added successfully', true);
        },
        error: (err) => {
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
}