import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderPublicComponent } from '../../shared/header-public/header-public.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    HeaderPublicComponent,
    FooterComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.registerForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
      ]],
      confirmPassword: ['', [
        Validators.required
      ]],
      terms: [false, [
        Validators.requiredTrue
      ]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validador personalizado para confirmar contraseña
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword && confirmPassword.errors?.['passwordMismatch']) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }

  // Getters para acceder fácilmente a los controles del formulario
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get terms() { return this.registerForm.get('terms'); }

  // Mensajes de error personalizados
  getFirstNameErrorMessage(): string {
    if (this.firstName?.hasError('required')) {
      return 'El nombre es obligatorio';
    }
    if (this.firstName?.hasError('minlength')) {
      return 'Mínimo 2 caracteres';
    }
    if (this.firstName?.hasError('pattern')) {
      return 'Solo se permiten letras y espacios';
    }
    return '';
  }

  getLastNameErrorMessage(): string {
    if (this.lastName?.hasError('required')) {
      return 'El apellido es obligatorio';
    }
    if (this.lastName?.hasError('minlength')) {
      return 'Mínimo 2 caracteres';
    }
    if (this.lastName?.hasError('pattern')) {
      return 'Solo se permiten letras y espacios';
    }
    return '';
  }

  getEmailErrorMessage(): string {
    if (this.email?.hasError('required')) {
      return 'El correo electrónico es obligatorio';
    }
    if (this.email?.hasError('email') || this.email?.hasError('pattern')) {
      return 'Formato de correo inválido';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.password?.hasError('required')) {
      return 'La contraseña es obligatoria';
    }
    if (this.password?.hasError('minlength')) {
      return 'Mínimo 6 caracteres';
    }
    if (this.password?.hasError('pattern')) {
      return 'Debe contener al menos una mayúscula, una minúscula y un número';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    if (this.confirmPassword?.hasError('required')) {
      return 'Debes confirmar tu contraseña';
    }
    if (this.confirmPassword?.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = {
        first_name: this.registerForm.value.firstName,
        last_name: this.registerForm.value.lastName,
        email: this.registerForm.value.email.toLowerCase().trim(),
        password: this.registerForm.value.password
      };

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.isLoading = false;

          if (response.success) {
          // 🎯 CAMBIO AQUÍ: Mostrar mensaje y redirigir al LOGIN
          alert('¡Cuenta creada exitosamente! Ahora inicia sesión con tus credenciales.');

            // Redirigir al dashboard
            this.router.navigate(['/login']);
          } else {
            // Error del servidor (pero status 200)
            this.errorMessage = response.message || 'Error en el registro';
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error en el registro:', error);

          // Manejar diferentes tipos de errores HTTP
          if (error.status === 409) {
            this.errorMessage = 'Este correo electrónico ya está registrado';
          } else if (error.status === 400) {
            this.errorMessage = error.error?.message || 'Datos de registro inválidos';
          } else if (error.status === 0) {
            this.errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
          } else {
            this.errorMessage = error.error?.message || 'Error al crear la cuenta. Por favor, intenta nuevamente.';
          }
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.markFormGroupTouched(this.registerForm);
    }
  }

  // Método para marcar todos los campos como touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Método para scroll (similar al login)
  scrollTo(section: string): void {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

    navigateToLogin(): void {
      this.router.navigate(['/login']);
  }
}
