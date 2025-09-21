import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-header-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-dashboard.component.html',
  styleUrls: ['./header-dashboard.component.css']
})

export class HeaderDashboardComponent implements OnInit {
  userName: string = 'Usuario';
  isDropdownOpen: boolean = false;
  user: any = null;

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.user) {
      this.userName = this.user.role === 'admin' ? 'Admin' : this.user.first_name;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}

