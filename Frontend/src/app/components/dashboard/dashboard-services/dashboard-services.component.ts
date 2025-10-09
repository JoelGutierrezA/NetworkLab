import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../services/auth/auth.service';
import { ServiceService } from '../../../services/service.service';
import { UserService } from '../../../services/user.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderDashboardComponent } from '../../shared/header-dashboard/header-dashboard.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderDashboardComponent,
    FooterComponent
  ],
  templateUrl: './dashboard-services.component.html',
  styleUrls: ['./dashboard-services.component.css']
})
export class DashboardServicesComponent implements OnInit, OnDestroy {
  getLabNameById(id: number): string {
    const lab = this.laboratories?.find((l: any) => l.id === id);
    return lab ? lab.name : 'Laboratorio';
  }
  searchTerm = '';
  selectedCategory = '';
  selectedProvider = '';

  providers: string[] = [
    'AGQ Labs Chile',
    'SGS Chile',
    'CICUC UC',
    'CeCim',
    'Uandes',
    'USACH',
    'UNAB',
    'UACh',
    'Quiteca',
    'EstudiosClinicos'
  ];

  services = [
    {
      name: 'Servicios de laboratorio (análisis, ensayos químicos, físico-químicos)',
      description: 'Análisis químicos, control de calidad, preparación de muestras, ensayos especializados',
      provider: 'AGQ Labs Chile',
      category: 'laboratorio'
    },
    {
      name: 'Servicios analíticos ambientales / de laboratorio',
      description: 'Servicios analíticos de ambiente, químicos, instrumentales aplicados a diversas industrias',
      provider: 'SGS Chile',
      category: 'laboratorio'
    },
    {
      name: 'Investigación clínica — protocolos, estudios, ensayos',
      description: 'Diseño, ejecución y seguimiento de estudios clínicos humanos',
      provider: 'CICUC UC',
      category: 'clínico'
    }
  ];

  filteredServices = [...this.services];
  showAddForm = false;
  // newService aligned with equipment table columns
  newService: any = {
    name: '',
    description: '',
    model: '',
    manufacturer: '',
    requires_training: false,
    status: 'available',
    laboratory_id: null
  };
  laboratories: any[] = [];

  labSearchTerm: string = '';
  showLabList: boolean = false;
  get filteredLaboratories(): any[] {
    if (!this.labSearchTerm) return this.laboratories;
    return this.laboratories.filter((lab: any) => lab.name.toLowerCase().includes(this.labSearchTerm.toLowerCase()));
  }
  selectLab(lab: any) {
    this.newService.laboratory_id = lab.id;
    this.labSearchTerm = lab.name;
    this.showLabList = false;
  }
  isLabManager = false;

  constructor(private readonly serviceService: ServiceService,
              private readonly userService: UserService,
              private readonly authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.isLabManager = user && user.role === 'lab_manager';

    // Cargar laboratorios: por institución si hay, si no, todos los laboratorios
    const loadLabs$ = user?.institution_id
      ? this.userService.getLaboratoriesByInstitution(user.institution_id)
      : this.userService.getAllLaboratories();

    loadLabs$.subscribe({
      next: (res: any) => {
        const list = res?.data || res?.laboratories; // compatibilidad con distintos formatos
        if (Array.isArray(list)) {
          this.laboratories = list;
          if (this.isLabManager && user?.laboratory_id) {
            const exists = this.laboratories.some((l: any) => l.id === user.laboratory_id);
            this.newService.laboratory_id = exists ? user.laboratory_id : null;
          }
        }
      },
      error: (err) => console.error('Error loading laboratories', err)
    });

    // If lab_manager and has laboratory_id, load services for that lab
    if (this.isLabManager && user.laboratory_id) {
      this.newService.laboratory_id = user.laboratory_id;
      this.loadServicesForLab(user.laboratory_id);
    } else {
      // otherwise load all services (optional)
      this.serviceService.getAllServices().subscribe({
        next: (res: any) => {
          if (res?.data) {
            this.services = res.data;
            this.filteredServices = [...this.services];
          }
        },
        error: (err) => console.error('Error loading services', err)
      });
    }
  }

  applyFilters(): void {
    this.filteredServices = this.services.filter(service => {
      const matchesSearch = this.searchTerm
        ? service.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;

      const matchesCategory = this.selectedCategory
        ? service.category === this.selectedCategory
        : true;

      const matchesProvider = this.selectedProvider
        ? service.provider === this.selectedProvider
        : true;

      return matchesSearch && matchesCategory && matchesProvider;
    });
  }

    loadServicesForLab(labId: number) {
      this.serviceService.getServicesByLab(labId).subscribe({
        next: (res: any) => {
          if (res?.data) {
            this.services = res.data;
            this.filteredServices = [...this.services];
          }
        },
        error: (err) => console.error('Error loading services for lab', err)
      });
    }

    toggleAddForm() {
      this.showAddForm = !this.showAddForm;
      try {
        if (this.showAddForm) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      } catch {}
    }

    submitNewService() {
    const labId = this.newService.laboratory_id;
    if (!labId) {
      alert('Seleccione un laboratorio para el servicio');
      return;
    }

    const payload = {
      name: this.newService.name,
      description: this.newService.description,
      model: this.newService.model,
      manufacturer: this.newService.manufacturer,
      requires_training: this.newService.requires_training,
      status: this.newService.status
    };

    this.serviceService.createService(labId, payload).subscribe({
      next: (res: any) => {
        if (res?.success) {
          // refresh list
          this.loadServicesForLab(labId);
          this.showAddForm = false;
          try { document.body.style.overflow = ''; } catch {}
          this.newService = { name: '', description: '', model: '', manufacturer: '', requires_training: false, status: 'available', laboratory_id: this.isLabManager ? labId : null };
        } else {
          alert('Error al crear servicio');
        }
      },
      error: (err: any) => {
        alert('Error al crear servicio: ' + (err.message || err.statusText || err));
      }
    });
    }

    ngOnDestroy(): void {
      try { document.body.style.overflow = ''; } catch {}
    }
}
