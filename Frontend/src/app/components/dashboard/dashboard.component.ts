import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderDashboardComponent } from '../shared/header-dashboard/header-dashboard.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
  CommonModule,
  HeaderDashboardComponent
]
})
export class DashboardComponent implements OnInit {
  user: any = {
    name: 'Dr. Juan Pérez',
    email: 'juan.perez@networklab.com',
    role: 'Investigador Principal',
    avatar: '👨‍🔬'
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Cargar datos del usuario desde localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = { ...this.user, ...JSON.parse(userData) };
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  scrollTo(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
