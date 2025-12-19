import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonContent, IonHeader, IonInput, IonItem, IonLabel, IonSearchbar,
  IonSelect, IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar
} from '@ionic/angular/standalone';
import { BottomTabsComponent } from '../../components/bottom-tabs/bottom-tabs.component';
import { AuthService } from '../../services/auth.service';
import { ServiceItem, ServicesApiService } from '../../services/services-api.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonSearchbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonToggle,
    BottomTabsComponent
  ],
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss']
})
export class ServicesPage implements OnInit {

  services: ServiceItem[] = [];

  /** UI states */
  searchTerm = '';
  showAddForm = false;
  // compatibility with older template bindings
  newName = '';
  newDesc = '';

  /** Form model for create/edit */
  formModel: Partial<ServiceItem> = {
    name: '',
    description: '',
    model: '',
    manufacturer: '',
    requires_training: false,
    status: 'available',
    laboratory_id: null
  };
  editingId: number | null = null;
  /** View-only mode for students */
  viewOnly = false;

  private nextId = 1;

  /** Alerts */
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | 'info' | null = null;
  private alertTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly api: ServicesApiService,
    private readonly auth: AuthService
  ) { }

  ngOnInit(): void {
    this.loadServices();
  }

  /** Load data from API */
  private loadServices() {
    const user = this.auth.getUser();
    const labId = user?.laboratory_id || null;

    const obs = labId ? this.api.listByLab(Number(labId)) : this.api.list();

    obs.subscribe({
      next: (list) => {
        this.services = list || [];
        const max = this.services.reduce((m, s) => Math.max(m, s.id || 0), 0);
        this.nextId = max + 1;
      },
      error: (err) => {
        console.error('Error cargando servicios', err);
        this.showAlert('Error cargando servicios. Usando datos locales.', 'error');
        this.services = [
          { id: 1, name: 'Servicio 1', description: 'Descripción 1' } as ServiceItem,
          { id: 2, name: 'Servicio 2', description: 'Descripción 2' } as ServiceItem
        ];
        this.nextId = 3;
      }
    });
  }

  /** Search filter */
  get filteredServices() {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this.services;

    return this.services.filter(s =>
      ((s.name || '') + ' ' + (s.description || '')).toLowerCase().includes(q)
    );
  }

  openAddForm() {
    // Block students from opening the add form and show alert
    if (this.isStudent) {
      this.showAlert('No tienes permiso para agregar servicios', 'error');
      return;
    }

    this.editingId = null;
    this.formModel = {
      name: '',
      description: '',
      model: '',
      manufacturer: '',
      requires_training: false,
      status: 'available',
      laboratory_id: null
    };
    this.showAddForm = !this.showAddForm;
  }

  openEdit(service: ServiceItem) {
    this.editingId = service.id ?? null;
    this.formModel = { ...service };
    this.viewOnly = false;
    this.showAddForm = true;
  }

  /** Open service in view-only mode (for students) */
  openView(service: ServiceItem) {
    this.editingId = service.id ?? null;
    this.formModel = { ...service };
    this.viewOnly = true;
    this.showAddForm = true;
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingId = null;
    this.formModel = {
      name: '',
      description: '',
      model: '',
      manufacturer: '',
      requires_training: false,
      status: 'available',
      laboratory_id: null
    };
  }

  /** Create or update */
  /** Simple add used by older template markup */
  addService() {
    const name = (this.newName || '').trim();
    const description = (this.newDesc || '').trim();
    if (!name) return this.showAlert('El nombre es obligatorio', 'error');

    const temp: ServiceItem = { id: this.nextId++, name, description } as ServiceItem;
    this.services.unshift(temp);
    this.newName = '';
    this.newDesc = '';

    this.api.create({ name, description }).subscribe({
      next: (created) => {
        const idx = this.services.findIndex(s => s === temp);
        if (idx >= 0) this.services[idx] = created;
        this.showAlert('Servicio guardado', 'success');
      },
      error: () => this.showAlert('No se pudo guardar en el servidor', 'error')
    });
  }
  saveForm() {
    // if we're viewing only, just close the form
    if (this.viewOnly) { this.cancelForm(); return; }

    const name = (this.formModel.name || '').toString().trim();
    if (!name)
      return this.showAlert('El nombre es obligatorio', 'error');

    const payload: Partial<ServiceItem> = {
      name,
      description: this.formModel.description || '',
      model: this.formModel.model || null,
      manufacturer: this.formModel.manufacturer || null,
      requires_training: !!this.formModel.requires_training,
      status: this.formModel.status || 'available',
      laboratory_id: this.formModel.laboratory_id ?? null
    };

    /** UPDATE */
    if (this.editingId != null) {
      const id = this.editingId;

      this.api.update(id, payload).subscribe({
        next: () => {
          const idx = this.services.findIndex(s => s.id === id);
          if (idx !== -1) {
            this.services[idx] = { ...this.services[idx], ...payload } as ServiceItem;
          }
          this.showAlert('Servicio actualizado', 'success');
          this.cancelForm();
        },
        error: () => this.showAlert('Error al actualizar', 'error')
      });

      return;
    }

    /** CREATE */
    const temp: ServiceItem = {
      id: this.nextId++,
      name: payload.name as string,
      description: payload.description
    } as ServiceItem;

    this.services.unshift(temp);
    this.showAddForm = false;

    this.api.create({ name: payload.name as string, description: payload.description || '' }).subscribe({
      next: (created) => {
        const idx = this.services.findIndex(s => s === temp);
        if (idx >= 0) this.services[idx] = created;
        this.showAlert('Servicio guardado', 'success');
      },
      error: () => this.showAlert('No se pudo guardar en el servidor', 'error')
    });
  }

  /** Delete */
  removeService(id: number) {
    const backup = [...this.services];

    this.services = this.services.filter(s => s.id !== id);

    this.api.delete(id).subscribe({
      next: () => { },
      error: () => {
        this.services = backup;
        this.showAlert('No se pudo eliminar. Lista restaurada.', 'error');
      }
    });
  }

  /** Alerts */
  showAlert(msg: string, type: 'success' | 'error' | 'info' = 'info', ms = 4000) {
    if (this.alertTimeout) clearTimeout(this.alertTimeout);

    this.alertMessage = msg;
    this.alertType = type;

    this.alertTimeout = setTimeout(() => this.clearAlert(), ms);
  }

  clearAlert() {
    this.alertMessage = null;
    this.alertType = null;
    if (this.alertTimeout) clearTimeout(this.alertTimeout);
  }

  /** Convenience getter to detect student role */
  get isStudent(): boolean {
    const u = this.auth.getUser();
    return u?.role === 'student';
  }
}
