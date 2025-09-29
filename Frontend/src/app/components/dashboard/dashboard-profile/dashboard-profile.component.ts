import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Componentes compartidos
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderDashboardComponent } from '../../shared/header-dashboard/header-dashboard.component';

// Servicios
import { UserService } from '../../../services/user.service';

// TabKey extendido (para admins y usuarios comunes)
type TabKey =
  | 'info'
  | 'security'
  | 'institutions'
  | 'users'
  | 'activity'
  | 'notifications';

@Component({
  selector: 'app-dashboard-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderDashboardComponent, FooterComponent, RouterModule,],
  templateUrl: './dashboard-profile.component.html',
  styleUrls: ['./dashboard-profile.component.css'],
})
export class DashboardProfileComponent implements OnInit {
  // Tabs
  activeTab: TabKey = 'info';

  // Estado de edición (perfil)
  isEditing = false;
  private snapshot: any = null;

  // Datos de usuario
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  bio = '';
  role: string = '';
  selectedInstitution: number | null = null;

  // Seguridad
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  isSubmitting = false;
  successMsg = '';
  errorMsg = '';

  // Instituciones
  institutions: any[] = [];
  filteredInstitutions: any[] = [];
  institutionSearch: string = '';

  // Paginación
  page: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    this.firstName = userData.first_name;
    this.lastName = userData.last_name;
    this.email = userData.email;
    this.role = userData.role;
    this.selectedInstitution = userData.institution_id || null;

    this.loadInstitutions();
  }

  // Instituciones
  loadInstitutions(): void {
    this.userService.getInstitutions().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.institutions = res.institutions;
          this.filteredInstitutions = [...this.institutions];
        }
      },
      error: (err: any) => console.error('❌ Error cargando instituciones', err),
    });
  }

  filterInstitutions(): void {
    const term = this.institutionSearch.toLowerCase();
    this.filteredInstitutions = this.institutions.filter(
      (i) =>
        i.name.toLowerCase().includes(term)
    );
  }

  viewInstitution(id: number): void {
    this.router.navigate(['/dashboard-profile/institution', id]);
  }

  // Tabs
  setTab(tab: TabKey): void {
    this.activeTab = tab;
    if (tab !== 'security') {
      this.resetSecurityFeedback();
    }
  }

  // Perfil
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
    try {
      const raw = localStorage.getItem('user');
      const u = raw ? JSON.parse(raw) : {};

      u.first_name = this.firstName;
      u.last_name = this.lastName;
      u.email = this.email;
      u.phone = this.phone;
      u.bio = this.bio;
      u.institution_id = this.selectedInstitution;

      localStorage.setItem('user', JSON.stringify(u));

      if (this.selectedInstitution) {
        this.userService.updateInstitution(u.id, { institutionId: this.selectedInstitution })
          .subscribe({
            next: (res: any) => console.log('✅', res.message),
            error: (err: any) =>
              console.error('❌ Error actualizando institución', err),
          });
      }
    } catch (error) {
      console.error('❌ Error guardando perfil', error);
    }

    this.isEditing = false;
  }

  // Seguridad
  changePassword(): void {
    this.resetSecurityFeedback();

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

    this.userService
      .changePassword(userId, this.oldPassword, this.newPassword)
      .subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          if (res?.success) {
            this.successMsg =
              res.message || 'Contraseña actualizada correctamente.';
            this.oldPassword = '';
            this.newPassword = '';
            this.confirmPassword = '';
          } else {
            this.errorMsg =
              res?.message || 'No se pudo actualizar la contraseña.';
          }
        },
        error: (err: any) => {
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

  // Paginación
  getPagedInstitutions(): any[] {
    this.totalPages = Math.ceil(
      this.filteredInstitutions.length / this.pageSize
    );
    const start = (this.page - 1) * this.pageSize;
    return this.filteredInstitutions.slice(start, start + this.pageSize);
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }
}
