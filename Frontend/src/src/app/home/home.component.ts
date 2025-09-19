import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FooterComponent } from '../components/shared/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    CommonModule,
    FooterComponent
  ]
})

export class HomeComponent implements OnInit {
  isMenuActive = false;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.initAnimations();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

scrollTo(section: string) {
  const el = document.getElementById(section);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.revealOnScroll();
    this.handleHeaderScroll();
  }

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
  }

  // Agrega esta función para el botón "Crear Cuenta"
  goToSignup() {
    this.router.navigate(['/signup']); // O la ruta que uses para registro
  }

  private initAnimations(): void {
    setTimeout(() => {
      this.revealOnScroll();
    }, 100);
  }

  private revealOnScroll(): void {
    const reveals = document.querySelectorAll('.scroll-reveal');

    reveals.forEach(element => {
      const elementTop = (element as HTMLElement).getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('revealed');
      }
    });
  }

  private handleHeaderScroll(): void {
    const header = document.querySelector('.header') as HTMLElement;
    if (!header) return;

    if (window.scrollY > 100) {
      header.style.background = 'rgba(255, 255, 255, 0.98)';
      header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    } else {
      header.style.background = 'rgba(255, 255, 255, 0.95)';
      header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
  }
}
