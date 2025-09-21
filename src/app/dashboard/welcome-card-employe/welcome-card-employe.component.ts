import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeService } from '../../services/employe/employe.service';
import { Employe } from '../../models/Employe.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-welcome-card-employe',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './welcome-card-employe.component.html',
  styleUrl: './welcome-card-employe.component.css'
})
export class WelcomeCardEmployeComponent implements OnInit {
  me: Employe | null = null;
  today: Date = new Date();
  greeting: string = '';

  constructor(private employeService: EmployeService) {}

  ngOnInit(): void {
    this.setGreeting();
    this.loadMe();
  }

  private setGreeting(): void {
    const hour = this.today.getHours();
    if (hour < 12) {
      this.greeting = 'Good morning';
    } else if (hour < 18) {
      this.greeting = 'Good afternoon';
    } else {
      this.greeting = 'Good evening';
    }
  }

  loadMe(): void {
    this.employeService.me().subscribe({
      next: (req: Employe) => {
        this.me = req;
      },
      error: (err) => {
        console.error('Error fetching employee data:', err);
        this.me = null;
      }
    });
  }
}