import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { SupplierDTO, SupplierService } from '../../../../services/supplier.service';

interface Supplier {
  id?: number;
  name: string;
  description?: string | null;
  website?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  created_at?: string | null;
}

@Component({
  selector: 'app-suppliers-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers-detail.component.html',
  styleUrls: ['./suppliers-detail.component.css']
})
export class SuppliersDetailComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  loading = false;
  search = '';
  errorMsg = '';
  modalError = '';

  // confirm delete in-ui
  pendingDelete: { id?: number; name?: string } | null = null;

  showForm = false;
  isEditing = false;
  formModel: any = { name: '' };

  constructor(
    private readonly supplierService: SupplierService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.loading = true;
    this.errorMsg = '';
    this.supplierService.list().subscribe({
      next: (res) => {
        this.suppliers = (res?.data as Supplier[]) || [];
        this.filteredSuppliers = [...this.suppliers];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading suppliers', err);
        this.errorMsg = 'No se pudo cargar los proveedores. Revisa la conexión o intenta más tarde.';
      }
    });
  }

  retry() {
    this.loadSuppliers();
  }

  filterSuppliers() {
    const q = (this.search || '').trim().toLowerCase();
    if (!q) {
      this.filteredSuppliers = [...this.suppliers];
      return;
    }
    this.filteredSuppliers = this.suppliers.filter(s => {
      return (s.name || '').toLowerCase().includes(q) || (s.country || '').toLowerCase().includes(q) || (s.city || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
    });
  }

  openCreate() {
    this.isEditing = false;
    this.formModel = { name: '', description: '', website: '', country: '', city: '', address: '', adminEmail: '', adminPassword: '', adminFirstName: '', adminLastName: '' };
    this.showForm = true;
    this.modalError = '';
    try { document.body.style.overflow = 'hidden'; } catch {}
  }

  openEdit(s: Supplier) {
    this.isEditing = true;
    this.formModel = { ...s };
    this.showForm = true;
    this.modalError = '';
    try { document.body.style.overflow = 'hidden'; } catch {}
  }

  closeForm() {
    this.showForm = false;
    this.formModel = { name: '' } as Supplier;
    try { document.body.style.overflow = ''; } catch {}
  }

  save() {
    if (!this.formModel.name || this.formModel.name.trim() === '') {
      this.modalError = 'El nombre del proveedor es obligatorio.';
      return;
    }

    const payload = {
      name: this.formModel.name,
      description: this.formModel.description,
      website: this.formModel.website,
      country: this.formModel.country,
      city: this.formModel.city,
      address: this.formModel.address
    };

    if (this.isEditing && this.formModel.id) {
      this.supplierService.update(this.formModel.id, payload as SupplierDTO).subscribe({
        next: (res) => {
          if (res?.success) {
            this.loadSuppliers();
            this.closeForm();
          } else {
            this.modalError = 'Error al actualizar proveedor';
          }
        },
        error: (err) => this.handleError(err)
      });
    } else {
      // Require admin credentials when creating a supplier (email, username, password)
      const adminEmail = (this.formModel.adminEmail || '').trim();
      const adminFirst = (this.formModel.adminFirstName || '').trim();
      const adminLast = (this.formModel.adminLastName || '').trim();
      const adminPassword = (this.formModel.adminPassword || '').trim();
      if (!adminEmail || !adminFirst || !adminLast || !adminPassword) {
        this.modalError = 'Al crear un proveedor debes proporcionar correo, nombre, apellido y contraseña del administrador.';
        return;
      }
      const hasAdmin = true;
      if (hasAdmin) {
        const provider = {
          name: this.formModel.name,
          description: this.formModel.description,
          website: this.formModel.website,
          country: this.formModel.country,
          city: this.formModel.city,
          address: this.formModel.address
        } as SupplierDTO;
        const admin = {
          email: adminEmail,
          password: adminPassword,
          first_name: adminFirst,
          last_name: adminLast
        };
        this.supplierService.createWithAdmin(provider, admin).subscribe({
          next: (res) => {
            if (res?.success) {
              this.loadSuppliers();
              this.closeForm();
            } else {
              this.modalError = 'Error al crear proveedor con administrador';
            }
          },
          error: (err) => this.handleError(err)
        });
        return;
      }
      // fallback: normal create
      // debug token/payload
      try { console.debug('POST suppliers payload', payload, 'token=', this.authService.getToken()); } catch {}
      this.supplierService.create(payload as SupplierDTO).subscribe({
        next: (res) => {
          if (res?.success) {
            this.loadSuppliers();
            this.closeForm();
          } else {
            this.modalError = 'Error al crear proveedor';
          }
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  // inicia confirmación in-UI para borrado
  confirmDelete(s: Supplier) {
    if (!s.id) return;
    this.pendingDelete = { id: s.id, name: s.name };
  }

  // cancelar borrado
  cancelDelete() {
    this.pendingDelete = null;
  }

  // proceder con borrado confirmado
  proceedDelete() {
    const id = this.pendingDelete?.id;
    if (!id) return;
    this.supplierService.delete(id).subscribe({
      next: (res) => {
        if (res?.success) {
          this.loadSuppliers();
        } else {
          this.errorMsg = 'Error al eliminar proveedor';
        }
        this.pendingDelete = null;
      },
      error: (err) => {
        this.handleError(err);
        this.pendingDelete = null;
      }
    });
  }

  private handleError(err: any) {
    console.error('Suppliers error', err);
    const status = err?.status;
    if (status === 401) {
      // no autorizado -> limpiar sesión y redirigir a login
      this.errorMsg = 'No autorizado. Por favor inicia sesión de nuevo.';
      try { this.authService.logout(); } catch {}
  this.router.navigate(['/login']).catch(()=>{});
      return;
    }
    // mensaje genérico o mensaje del backend
    this.errorMsg = (err?.error?.message) ? err.error.message : 'Ocurrió un error. Intenta nuevamente.';
  }
}
