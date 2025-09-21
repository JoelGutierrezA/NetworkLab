import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  template: `
    <div class="container">
      <div class="error-content">
        <h1>⛔ Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta página.</p>
        <p>Contacta al administrador si necesitas acceso.</p>
        <button (click)="goToDashboard()" class="btn-primary">
          Volver al Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      padding: 20px;
    }
    .error-content {
      text-align: center;
      max-width: 500px;
    }
    h1 {
      color: #e53e3e;
      margin-bottom: 20px;
    }
    p {
      color: #718096;
      margin-bottom: 10px;
    }
    .btn-primary {
      background: #667eea;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 20px;
    }
    .btn-primary:hover {
      background: #764ba2;
    }
  `]
})
export class AccessDeniedComponent {
  constructor(private readonly router: Router) {}

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
