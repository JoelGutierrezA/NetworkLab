import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SupplierService } from '../../../services/supplier.service';
import { UserService } from '../../../services/user.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderDashboardComponent } from '../../shared/header-dashboard/header-dashboard.component';

// Tipado para Tabs
type TabKey = 'info' | 'security' | 'institutions' | 'suppliers' | 'users' | 'activity' | 'notifications' | 'metrics';

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

  // Crear nueva institución (con admin opcional)
  showCreateInstitutionForm = false;
  newInstitution: any = {
    name: '',
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: ''
  };

  // Usuarios (solo admin)
  users: any[] = [];
  filteredUsers: any[] = [];
  userSearch = '';
  userPage = 1;
  userPageSize = 5;
  userTotalPages = 1;
  usersLastMonth = 0;

  // Proveedores (admin)
  suppliers: any[] = [];
  filteredSuppliers: any[] = [];
  supplierSearch = '';
  supplierPage = 1;
  supplierPageSize = 5;
  supplierTotalPages = 1;

  // Nuevo proveedor (modal)
  showNewSupplierForm = false;
  newSupplier: any = {
    name: '',
    country: '',
    city: '',
    website: '',
    description: '',
    // admin account fields (optional when creating a supplier)
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    adminPassword: ''
  };

  // Edit supplier state
  isEditingSupplier = false;
  editingSupplierId: number | null = null;

  constructor(
  private readonly userService: UserService,
  public readonly router: Router,
    private readonly route: ActivatedRoute
    ,
    private readonly supplierService: SupplierService
  ) {}

  // Inyectar SupplierService


  ngOnInit(): void {
    this.loadLocalUser();
    this.loadInstitutions();
    // If navigation requests a specific tab, open it
    this.route.queryParams.subscribe((q: any) => {
      if (q?.tab) this.setTab(q.tab as TabKey);
    });
    if (this.role === 'admin') {
      this.loadUsers();
      this.loadMetrics();
      this.loadSuppliers();
  }
  }

  /* Proveedores */
  loadSuppliers(): void {
    this.supplierService.list().subscribe({
      next: (res: any) => {
        this.suppliers = res?.data || [];
        this.filteredSuppliers = [...this.suppliers];
      },
      error: (err) => console.error('Error cargando proveedores', err)
    });
  }

  filterSuppliers(): void {
    const q = (this.supplierSearch || '').trim().toLowerCase();
    if (!q) {
      this.filteredSuppliers = [...this.suppliers];
      return;
    }
    this.filteredSuppliers = this.suppliers.filter((s: any) => {
      return (s.name || '').toLowerCase().includes(q) || (s.country || '').toLowerCase().includes(q) || (s.city || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
    });
  }

  getPagedSuppliers(): any[] {
    this.supplierTotalPages = Math.ceil(this.filteredSuppliers.length / this.supplierPageSize) || 1;
    const start = (this.supplierPage - 1) * this.supplierPageSize;
    return this.filteredSuppliers.slice(start, start + this.supplierPageSize);
  }

  nextSupplierPage(): void {
    if (this.supplierPage < this.supplierTotalPages) this.supplierPage++;
  }

  prevSupplierPage(): void {
    if (this.supplierPage > 1) this.supplierPage--;
  }

  viewSupplier(id: number): void {
    this.router.navigate(['/dashboard-profile/supplier', id]);
  }

  openNewSupplier(): void {
    this.isEditingSupplier = false;
    this.editingSupplierId = null;
    this.newSupplier = { name: '', country: '', city: '', website: '', description: '', adminEmail: '', adminUsername: '', adminPassword: '' };
    this.showNewSupplierForm = true;
  }

  closeNewSupplier(): void {
    this.showNewSupplierForm = false;
    this.newSupplier = { name: '', country: '', city: '', website: '', description: '', adminEmail: '', adminUsername: '', adminPassword: '' };
  }

  createSupplier(): void {
    // Prevent calling admin-only endpoint if current user isn't admin
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Necesitas permisos de administrador para crear proveedores con cuenta admin. Inicia sesión como admin.');
      console.debug('Intento de crear proveedor con admin sin permisos. user=', currentUser, 'token=', localStorage.getItem('token'));
      return;
    }
    const payload = {
      name: this.newSupplier.name,
      country: this.newSupplier.country,
      city: this.newSupplier.city,
      website: this.newSupplier.website,
      description: this.newSupplier.description
    };
    if (!payload.name || payload.name.trim() === '') {
      alert('El nombre del proveedor es obligatorio');
      return;
    }
    // If admin credentials were provided, require all three (email, username, password)
    const adminProvided = !!(this.newSupplier.adminEmail || this.newSupplier.adminFirstName || this.newSupplier.adminLastName || this.newSupplier.adminPassword);
    if (adminProvided) {
      const adminEmail = (this.newSupplier.adminEmail || '').trim();
      const adminFirstName = (this.newSupplier.adminFirstName || '').trim();
      const adminLastName = (this.newSupplier.adminLastName || '').trim();
      const adminPassword = (this.newSupplier.adminPassword || '').trim();
      if (!adminEmail || !adminFirstName || !adminLastName || !adminPassword) {
        alert('Al crear un proveedor con administrador, completa correo, nombre, apellido y contraseña.');
        return;
      }
      const provider = payload;
      const admin = { email: adminEmail, first_name: adminFirstName, last_name: adminLastName, password: adminPassword };
      this.supplierService.createWithAdmin(provider, admin).subscribe({
        next: (res: any) => {
          if (res?.success) {
            this.loadSuppliers();
            this.closeNewSupplier();
          } else {
            alert(res?.message || 'No se pudo crear el proveedor con administrador');
          }
        },
        error: (err) => {
          console.error('Error creando proveedor con admin', err);
          alert(err?.error?.message || 'Error creando proveedor con administrador. Revisa la consola.');
        }
      });
      return;
    }

    this.supplierService.create(payload).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.loadSuppliers();
          this.closeNewSupplier();
        } else {
          alert(res?.message || 'No se pudo crear el proveedor');
        }
      },
      error: (err) => {
        console.error('Error creando proveedor', err);
        alert('Error creando proveedor. Revisa la consola.');
      }
    });
  }

  openEditSupplier(s: any): void {
    this.isEditingSupplier = true;
    this.editingSupplierId = s.id || null;
    this.newSupplier = { name: s.name || '', country: s.country || '', city: s.city || '', website: s.website || '', description: s.description || '' };
    this.showNewSupplierForm = true;
  }

  updateSupplier(): void {
    if (!this.editingSupplierId) return;
    const payload = {
      name: this.newSupplier.name,
      country: this.newSupplier.country,
      city: this.newSupplier.city,
      website: this.newSupplier.website,
      description: this.newSupplier.description
    };
    this.supplierService.update(this.editingSupplierId, payload).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.loadSuppliers();
          this.closeNewSupplier();
        } else {
          alert(res?.message || 'No se pudo actualizar el proveedor');
        }
      },
      error: (err) => {
        console.error('Error actualizando proveedor', err);
        alert('Error actualizando proveedor. Revisa la consola.');
      }
    });
  }

  deleteSupplier(id?: number): void {
    if (!id) return;
    const ok = confirm('¿Eliminar proveedor? Esta acción no se puede deshacer.');
    if (!ok) return;
    this.supplierService.delete(id).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.loadSuppliers();
        } else {
          alert(res?.message || 'No se pudo eliminar el proveedor');
        }
      },
      error: (err) => {
        console.error('Error eliminando proveedor', err);
        alert('Error eliminando proveedor. Revisa la consola.');
      }
    });
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
        // Ordenar por created_at desc (más nuevos primero)
        this.users.sort((a: any, b: any) => {
          const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
          const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
          return tb - ta;
        });
        this.filteredUsers = [...this.users];
        // calcular usuarios del último mes si hay created_at
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        this.usersLastMonth = this.users.filter((u: any) => {
          const t = u?.created_at ? new Date(u.created_at).getTime() : 0;
          return t && (now - t) <= THIRTY_DAYS;
        }).length;
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

  deleteUser(id?: number): void {
    if (!id) return;
    // Verificar permisos en frontend para evitar llamadas que sabemos fallarán
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!currentUser || currentUser.role !== 'admin') {
      alert('No tienes permisos para eliminar usuarios. Inicia sesión como administrador.');
      console.debug('Intento de eliminación sin permisos', { currentUser, token: localStorage.getItem('token') });
      return;
    }
    const ok = confirm('¿Seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.');
    if (!ok) return;
    this.userService.deleteUser(id).subscribe({
      next: (res: any) => {
        if (res?.success) {
          // recargar lista de usuarios
          this.loadUsers();
        } else {
          alert(res?.message || 'No se pudo eliminar el usuario');
        }
      },
      error: (err) => {
        console.error('Error eliminando usuario', err);
        alert(err?.error?.message || 'Error eliminando usuario. Revisa la consola.');
      }
    });
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

  // Crear institución desde el dashboard (solo admin)
  toggleCreateInstitutionForm(): void {
    this.showCreateInstitutionForm = !this.showCreateInstitutionForm;
    if (!this.showCreateInstitutionForm) {
      this.newInstitution = { name: '', adminEmail: '', adminPassword: '', adminFirstName: '', adminLastName: '' };
    }
  }

  createInstitution(): void {
    // validación simple
    if (!this.newInstitution.name || this.newInstitution.name.trim().length === 0) {
      alert('El nombre de la institución es obligatorio');
      return;
    }

    // Llamada al servicio
    this.userService.createInstitution(this.newInstitution).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert('✅ Institución creada correctamente');
          this.loadInstitutions();
          this.toggleCreateInstitutionForm();
        } else {
          alert('Error: ' + (res.message || 'No se pudo crear la institución'));
        }
      },
      error: (err) => {
        console.error('❌ Error creando institución', err);
        alert(err?.error?.message || 'Error creando institución');
      }
    });
  }
}
