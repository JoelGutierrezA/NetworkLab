import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Componentes compartidos
import { FooterComponent } from '../../../shared/footer/footer.component';
import { HeaderDashboardComponent } from '../../../shared/header-dashboard/header-dashboard.component';

// Servicios
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-institution',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderDashboardComponent, FooterComponent],
  templateUrl: './institution.component.html',
  styleUrls: ['./institution.component.css'],
})

export class InstitutionComponent implements OnInit {
  institution: any = null;
  isEditing: boolean = false;
  showDeleteConfirm: boolean = false;
  originalInstitution: any = null;

  // Estado para mostrar u ocultar el formulario
  showAddLabForm: boolean = false;

  // Modelo del nuevo laboratorio
  newLab = {
    name: '',
    description: '',
    location: '',
    contact_email: '',
    website: '',
    research_areas: '',
    // Campos para crear el admin/director del laboratorio (ahora obligatorios)
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: ''
  };

  laboratories: any[] = [];

  // Estado para edición inline de laboratorios
  editingLabId: number | null = null;
  editLabModel: any = null;

  constructor(
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadInstitution(id);
    }
  }

  loadInstitution(id: number): void {
    this.userService.getInstitutionById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.institution = res['institution'];
          this.loadLaboratories(id);
        }
      },
      error: (err) => console.error('❌ Error cargando institución', err),
    });
  }


  toggleEdit(): void {
    // Al entrar en modo edición guardamos una copia para permitir cancelar
    if (!this.isEditing && this.institution) {
      this.originalInstitution = JSON.parse(JSON.stringify(this.institution));
    }
    this.isEditing = !this.isEditing;
  }

  cancelEdit(): void {
    if (this.originalInstitution) {
      this.institution = JSON.parse(JSON.stringify(this.originalInstitution));
      this.originalInstitution = null;
    }
    this.isEditing = false;
  }

  saveChanges(): void {
    if (!this.institution?.id) return;

    this.userService.updateInstitution(this.institution.id, this.institution).subscribe({
      next: (res) => {
        console.log('✅ Institución actualizada', res);
        this.isEditing = false;
      },
      error: (err) => console.error('❌ Error actualizando institución', err),
    });
  }

  goBack(): void {
    // Navigate back to dashboard and request the institutions tab
    this.router.navigate(['/dashboard-profile'], { queryParams: { tab: 'institutions' } });
  }

  // Open confirmation modal
  openDeleteConfirm(): void {
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
  }

  // Called when user confirms deletion in modal
  confirmDeleteInstitution(): void {
    if (!this.institution?.id) return;
    this.userService.deleteInstitution(this.institution.id).subscribe({
      next: (res) => {
        console.log('✅ Institución eliminada', res);
        this.showDeleteConfirm = false;
        this.router.navigate(['/dashboard-profile'], { queryParams: { tab: 'institutions' } });
      },
      error: (err) => {
        console.error('❌ Error eliminando institución', err);
        this.showDeleteConfirm = false;
      },
    });
  }

  loadLaboratories(id: number): void {
    this.userService.getLaboratoriesByInstitution(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.laboratories = res.laboratories;
        }
      },
      error: (err) => console.error('❌ Error cargando laboratorios', err),
    });
  }

  // Mostrar/ocultar formulario
  toggleAddLabForm(): void {
    // Si estamos cerrando el formulario, limpiar el modelo para evitar datos residuales
    if (this.showAddLabForm) {
      this.newLab = { name: '', description: '', location: '', contact_email: '', website: '', research_areas: '', adminEmail: '', adminPassword: '', adminFirstName: '', adminLastName: '' };
    }
    this.showAddLabForm = !this.showAddLabForm;
  }

  // Guardar laboratorio nuevo
  addLaboratory(): void {
    if (!this.institution?.id) return;

    this.userService.createLaboratory(this.institution.id, this.newLab).subscribe({
      next: (res: any) => {
        if (res.success) {
          console.log('✅ Laboratorio agregado correctamente');
          this.loadLaboratories(this.institution.id); // refresca la lista
          this.toggleAddLabForm(); // cierra el formulario
          this.newLab = { name: '', description: '', location: '', contact_email: '', website: '', research_areas: '', adminEmail: '', adminPassword: '', adminFirstName: '', adminLastName: '' };
        }
      },
      error: (err) => console.error('❌ Error creando laboratorio', err),
    });
  }

  // Editar laboratorio inline
  startEditLab(lab: any): void {
    this.editingLabId = lab.id;
    // clonar los datos para editar sin mutar la lista inmediatamente
    this.editLabModel = { ...lab };
  }

  cancelEditLab(): void {
    this.editingLabId = null;
    this.editLabModel = null;
  }

  saveLabEdit(): void {
    if (!this.editLabModel || !this.editingLabId) return;

    this.userService.updateLaboratory(this.editingLabId, this.editLabModel).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.loadLaboratories(this.institution.id);
          this.cancelEditLab();
        }
      },
      error: (err) => console.error('❌ Error actualizando laboratorio', err),
    });
  }

  // Eliminar laboratorio con confirmación
  confirmDeleteLab(lab: any): void {
    if (!confirm(`¿Seguro que deseas eliminar el laboratorio "${lab.name}"?`)) return;

    this.userService.deleteLaboratory(lab.id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.loadLaboratories(this.institution.id);
        }
      },
      error: (err) => console.error('❌ Error eliminando laboratorio', err),
    });
  }
}
