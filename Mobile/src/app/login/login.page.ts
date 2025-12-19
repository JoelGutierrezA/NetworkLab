import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline, mailOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonIcon],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  logoFailed = false;
  showPassword = false;

  constructor(private readonly auth: AuthService, private readonly router: Router) {
    addIcons({ mailOutline, eyeOutline, eyeOffOutline });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  submit() {
    this.errorMessage = '';
    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.success) {
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = res?.message || 'Credenciales inválidas';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Login error:', err);
        this.errorMessage = err?.error?.message || err?.statusText || (err?.status ? `Error ${err.status}` : 'Error de conexión');
      }
    });
  }
}
