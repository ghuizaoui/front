import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Employe } from '../../models/Employe.model';


@Component({
  selector: 'app-welcome-card',
  templateUrl: './welcome-card.component.html',
  styleUrls: ['./welcome-card.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class WelcomeCardComponent implements OnInit {
  today: Date = new Date();
  username: string = '';
  greeting: string = '';
  todaysJobs: number = 0;
  newUsersToday: number = 0;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.setGreeting();
    this.authService.getCurrentUser().subscribe({
      next: (data: Employe) => {
        this.username = data.nom || 'Admin';
        console.log("Admin username:", this.username);
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        this.username = 'Admin'; // Fallback
      }
    });

    // Mock data - replace with actual API calls
    this.todaysJobs = 24;
    this.newUsersToday = 8;
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
}