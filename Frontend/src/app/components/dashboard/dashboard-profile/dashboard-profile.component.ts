import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderDashboardComponent } from '../../shared/header-dashboard/header-dashboard.component';

// Tipado para Tabs
type TabKey = 'info' | 'security' | 'institutions' | 'users' | 'activity' | 'notifications' | 'metrics';

@Component({
  selector: 'app-dashboard-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderDashboardComponent, FooterComponent, RouterModule],
  templateUrl: './dashboard-profile.component.html',
  styleUrls: ['./dashboard-profile.component.css'],
})
export class DashboardProfileComponent implements OnInit {
  // Tabs
  activeTab: TabKey = 'info';

  // Estado general
  isEditing = false;
  private snapshot: any = null;

  // Datos de usuario
  userData: any = {};
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  bio = '';
  role = '';
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
  institutionSearch = '';
  page = 1;
  pageSize = 5;
  totalPages = 1;

  totalLaboratories: number = 0;

  // Usuarios (solo admin)
  users: any[] = [];
  filteredUsers: any[] = [];
  userSearch = '';
  userPage = 1;
  userPageSize = 5;
  userTotalPages = 1;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadLocalUser();
    this.loadInstitutions();
    if (this.role === 'admin') {
      this.loadUsers();
      this.loadMetrics();
  }
  }

  /* Perfil de Usuario */
  private loadLocalUser(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userData = user;
    this.firstName = user.first_name || '';
    this.lastName = user.last_name || '';
    this.email = user.email || '';
    this.phone = user.phone || '';
    this.bio = user.bio || '';
    this.role = user.role || '';
    this.selectedInstitution = user.institution_id || null;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.snapshot = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        bio: this.bio,
      };
    }
  }

  cancelEdit(): void {
    if (this.snapshot) {
      Object.assign(this, this.snapshot);
    }
    this.isEditing = false;
  }

  saveProfile(): void {
    try {
      const updatedUser = {
        ...this.userData,
        first_name: this.firstName,
        last_name: this.lastName,
        email: this.email,
        phone: this.phone,
        bio: this.bio,
        institution_id: this.selectedInstitution,
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));

      if (this.selectedInstitution) {
        this.userService
          .updateInstitution(updatedUser.id, { institutionId: this.selectedInstitution })
          .subscribe({
            next: (res) => console.log('✅ Perfil actualizado:', res.message),
            error: (err) => console.error('❌ Error actualizando perfil:', err),
          });
      }
      this.isEditing = false;
    } catch (error) {
      console.error('❌ Error guardando perfil', error);
    }
  }

  /* Seguridad */
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

    const userId = this.userData.id;
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
          this.oldPassword = this.newPassword = this.confirmPassword = '';
        } else {
          this.errorMsg = res?.message || 'No se pudo actualizar la contraseña.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMsg = err?.error?.message || 'Error actualizando la contraseña.';
      },
    });
  }

  private resetSecurityFeedback(): void {
    this.successMsg = '';
    this.errorMsg = '';
    this.isSubmitting = false;
  }

  /* Instituciones */
  loadInstitutions(): void {
    this.userService.getInstitutions().subscribe({
      next: (res) => {
        if (res.success) {
          this.institutions = res['institutions'];
          this.filteredInstitutions = [...this.institutions];
        }
      },
      error: (err) => console.error('❌ Error cargando instituciones', err),
    });
  }

  filterInstitutions(): void {
    const term = this.institutionSearch.toLowerCase();
    this.filteredInstitutions = this.institutions.filter((i) =>
      i.name.toLowerCase().includes(term)
    );
  }

  viewInstitution(id: number): void {
    this.router.navigate(['/dashboard-profile/institution', id]);
  }

  getPagedInstitutions(): any[] {
    this.totalPages = Math.ceil(this.filteredInstitutions.length / this.pageSize);
    const start = (this.page - 1) * this.pageSize;
    return this.filteredInstitutions.slice(start, start + this.pageSize);
  }

  /* Usuarios */
  loadUsers(): void {
    this.userService.getUsuarios(1, 9999).subscribe({
      next: (res) => {
        this.users = res.usuarios || [];
        this.filteredUsers = [...this.users];
      },
      error: (err) => console.error('❌ Error cargando usuarios', err),
    });
  }

  filterUsers(): void {
    const term = this.userSearch.toLowerCase();
    this.filteredUsers = this.users.filter(
      (u) =>
        u.first_name.toLowerCase().includes(term) ||
        u.last_name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }

  getPagedUsers(): any[] {
    this.userTotalPages = Math.ceil(this.filteredUsers.length / this.userPageSize);
    const start = (this.userPage - 1) * this.userPageSize;
    return this.filteredUsers.slice(start, start + this.userPageSize);
  }

  nextUserPage(): void {
    if (this.userPage < this.userTotalPages) this.userPage++;
  }

  prevUserPage(): void {
    if (this.userPage > 1) this.userPage--;
  }

  viewUser(id: number): void {
    this.router.navigate(['/dashboard-profile/user', id]);
  }

  loadMetrics(): void {
  // Contar laboratorios
  this.institutions.forEach(inst => {
    this.userService.getLaboratoriesByInstitution(inst.id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.totalLaboratories += res.laboratories.length;
        }
      },
      error: (err) => console.error('❌ Error obteniendo laboratorios para métricas', err)
    });
  });
  }

  /* Paginación */
  nextPage(): void {
    if (this.page < this.totalPages) this.page++;
  }

  prevPage(): void {
    if (this.page > 1) this.page--;
  }

  /* Tabs */
  setTab(tab: TabKey): void {
    this.activeTab = tab;
    if (tab !== 'security') this.resetSecurityFeedback();
  }
}
