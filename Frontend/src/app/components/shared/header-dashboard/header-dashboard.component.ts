import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-header-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-dashboard.component.html',
  styleUrls: ['./header-dashboard.component.css']
})

export class HeaderDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  userName: string = 'Usuario';
  isDropdownOpen: boolean = false;
  user: any = null;
  @ViewChild('headerEl', { static: true }) headerEl!: ElementRef<HTMLElement>;
  private resizeHandler = () => this.updateHeaderHeight();

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.user) {
      this.userName = this.user.role === 'admin' ? 'Admin' : this.user.first_name;
    }
  }

  ngAfterViewInit(): void {
    // Inicializar la variable CSS con la altura real del header
    this.updateHeaderHeight();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
  }

  private updateHeaderHeight(): void {
    try {
      const el = this.headerEl?.nativeElement;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const height = Math.ceil(rect.height);
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    } catch (err) {
      // noop
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}

