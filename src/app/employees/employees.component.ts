import { Component, OnInit } from '@angular/core';
import {Employe} from '../models/Employe.model';
import {EmployeService} from '../services/employe/employe.service';
import {HeaderComponent} from '../shared/header/header.component';
import {FormsModule} from '@angular/forms';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {LayoutComponent} from '../shared/layout/layout.component';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  imports: [

    FormsModule,
    DatePipe,
    NgClass,
    NgForOf,
    NgIf],
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  employees: Employe[] = [];
  loading = false;

  // Pour l'ajout/modification
  editing: boolean = false;
  selected: Partial<Employe> = {};

  constructor(private employeService: EmployeService) {}

  ngOnInit(): void {
    this.fetchAll();
  }

  fetchAll() {
    this.loading = true;
    this.employeService.list().subscribe({
      next: (emps) => { this.employees = emps; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openAddModal() {
    this.editing = false;
    this.selected = {};
    // Ouvre le modal via JS ou bootstrap
    (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('addEmployee')).show();
  }

  openEditModal(emp: Employe) {
    this.editing = true;
    this.selected = { ...emp };
    (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('addEmployee')).show();
  }

  saveEmployee(form: any) {
    if (this.editing && this.selected.matricule) {
      this.employeService.update(this.selected.matricule, this.selected).subscribe(() => {
        this.fetchAll();
        (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('addEmployee')).hide();
      });
    } else {
      this.employeService.add(this.selected as any).subscribe(() => {
        this.fetchAll();
        (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('addEmployee')).hide();
      });
    }
  }

  // Pour la suppression (à implémenter si besoin)
  // deleteEmployee(matricule: string) {...}
}
