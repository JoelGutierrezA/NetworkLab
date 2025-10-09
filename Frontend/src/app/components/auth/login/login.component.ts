import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthResponse } from '../../../models/auth-response.model';
import { AuthService } from '../../../services/auth/auth.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderPublicComponent } from '../../shared/header-public/header-public.component';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FooterComponent,
    HeaderPublicComponent,
  ]
})

export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  passwordVisible = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false]
    });

    // Limpiar mensaje de error cuando el usuario empieza a editar
    this.loginForm.valueChanges.subscribe(() => {
      if (this.errorMessage) this.errorMessage = null;
    });
  }

  goToRegister(): void {
  this.router.navigate(['/register']);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: AuthResponse) => {
        console.log('✅ Respuesta backend:', response);

        if (!response?.success) {
          this.errorMessage = 'Credenciales inválidas';
          return;
        }

        // Guardar credenciales
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // 🔎 Debug y normalización del rol
        const rawRole = response.user?.role ?? '';
        console.log('🔎 role recibido =', `[${rawRole}]`, 'typeof =', typeof rawRole);

        const role = String(rawRole).trim().toLowerCase();
        localStorage.setItem('role', role); // por si algún guard usa 'role' directo

        // Redirección según rol
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('❌ Error en login:', err);
        this.errorMessage = 'Error al intentar iniciar sesión. Intenta de nuevo.';
      }
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}




