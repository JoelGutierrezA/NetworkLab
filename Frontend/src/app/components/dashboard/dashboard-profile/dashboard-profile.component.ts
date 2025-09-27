import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Ajusta estas rutas si tu estructura difiere
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderDashboardComponent } from '../../shared/header-dashboard/header-dashboard.component';

// Servicios (ajusta rutas si es necesario)
import { UserService } from '../../../services/user.service';

type TabKey = 'info' | 'security' | 'activity' | 'notifications';

@Component({
  selector: 'app-dashboard-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderDashboardComponent, FooterComponent],
  templateUrl: './dashboard-profile.component.html',
  styleUrls: ['./dashboard-profile.component.css'],
})
export class DashboardProfileComponent implements OnInit {
  // Tabs
  activeTab: TabKey = 'info';

  // Estado de edición (Info)
  isEditing = false;
  private snapshot: any = null;

  // Datos usuario (Info)
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  bio = '';

  // Seguridad: modelo del formulario
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  isSubmitting = false;
  successMsg = '';
  errorMsg = '';

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.loadUserFromStorage();
  }

  // ================= Helper: cargar usuario =================
  private loadUserFromStorage(): void {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        this.firstName = u.first_name ?? 'Admin';
        this.lastName = u.last_name ?? 'NetworkLab';
        this.email = u.email ?? 'admin@networklab.com';
        this.phone = u.phone ?? '+569 0000 0000';
        this.bio = u.bio ?? '';
      } else {
        this.setFallback();
      }
    } catch {
      this.setFallback();
    }
  }

  private setFallback(): void {
    this.firstName = 'Admin';
    this.lastName = 'NetworkLab';
    this.email = 'admin@networklab.com';
    this.phone = '+569 0000 0000';
    this.bio = '';
  }

  // ================= Tabs =================
  setTab(tab: TabKey): void {
    this.activeTab = tab;
    // Al cambiar de pestaña de seguridad, limpiamos mensajes/estado
    if (tab !== 'security') {
      this.resetSecurityFeedback();
    }
  }

  // ================= Info: editar/guardar =================
  toggleEdit(): void {
    if (!this.isEditing) {
      this.snapshot = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        bio: this.bio,
      };
      this.isEditing = true;
    } else {
      this.isEditing = false;
    }
  }

  cancelEdit(): void {
    if (this.snapshot) {
      this.firstName = this.snapshot.firstName;
      this.lastName = this.snapshot.lastName;
      this.email = this.snapshot.email;
      this.phone = this.snapshot.phone;
      this.bio = this.snapshot.bio;
    }
    this.isEditing = false;
  }

  saveProfile(): void {
    // Aquí iría tu request al backend para actualizar datos de perfil
    try {
      const raw = localStorage.getItem('user');
      const u = raw ? JSON.parse(raw) : {};
      u.first_name = this.firstName;
      u.last_name = this.lastName;
      u.email = this.email;
      u.phone = this.phone;
      u.bio = this.bio;
      localStorage.setItem('user', JSON.stringify(u));
    } catch {}
    this.isEditing = false;
  }

  // ================= Seguridad: cambio de contraseña =================
  changePassword(): void {
    this.resetSecurityFeedback();

    // Validaciones básicas en cliente
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMsg = 'Completa todos los campos.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMsg = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    const userId = this.getUserId();
    if (!userId) {
      this.errorMsg = 'No se pudo identificar al usuario.';
      return;
    }

    this.isSubmitting = true;

    this.userService.changePassword(userId, this.oldPassword, this.newPassword).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res?.success) {
          this.successMsg = res.message || 'Contraseña actualizada correctamente.';
          this.oldPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        } else {
          this.errorMsg = res?.message || 'No se pudo actualizar la contraseña.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMsg =
          err?.error?.message ||
          'Ocurrió un error al actualizar la contraseña. Intenta nuevamente.';
      },
    });
  }

  private getUserId(): number | null {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const u = JSON.parse(raw);
      return Number(u.id) || null;
    } catch {
      return null;
    }
  }

  private resetSecurityFeedback(): void {
    this.successMsg = '';
    this.errorMsg = '';
    this.isSubmitting = false;
  }
}
