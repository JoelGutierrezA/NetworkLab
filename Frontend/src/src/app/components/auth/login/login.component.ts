import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { FooterComponent } from '../../shared/footer/footer.component';


interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
    };
    token: string;
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FooterComponent
  ],
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  constructor(
  private readonly fb: FormBuilder,
  private readonly router: Router,
  private readonly authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false]
    });
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
  if (this.loginForm.invalid) {
    return;
  }

  this.authService.login(this.loginForm.value).subscribe({
    next: (response: any) => {
      console.log('🔎 Response del backend:', response);

      if (response.success) {
        // Ajuste: el usuario puede venir en "response.user" o en "response.data.user"
        const user = response.user || response.data?.user;

        if (!user) {
          console.error('❌ No se recibió usuario en la respuesta del backend');
          return;
        }

        // Guardar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(user));

        // Redirigir según el rol
        if (user.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        console.error('❌ Error en login:', response.message);
      }
    },
    error: (err) => {
      console.error('❌ Error de servidor:', err);
    }
    });
  }

  loginWithGoogle() {
    console.log('Login with Google');
  }

  loginWithMicrosoft() {
    console.log('Login with Microsoft');
  }

  // Métodos simples para el header
  scrollTo(sectionId: string): void {
    this.router.navigate(['/home']).then(() => {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    });
  }
};

