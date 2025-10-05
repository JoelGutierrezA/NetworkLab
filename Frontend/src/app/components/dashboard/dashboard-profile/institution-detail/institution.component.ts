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

  // Estado para mostrar u ocultar el formulario
  showAddLabForm: boolean = false;

  // Modelo del nuevo laboratorio
  newLab = {
    name: '',
    description: '',
    location: '',
    contact_email: '',
    website: '',
    research_areas: ''
  };

  laboratories: any[] = [];

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
    this.isEditing = !this.isEditing;
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
    this.router.navigate(['/dashboard-profile']);
  }

  deleteInstitution(): void {
    if (!this.institution?.id) return;
    if (!confirm('¿Seguro que deseas eliminar esta institución?')) return;

    this.userService.deleteInstitution(this.institution.id).subscribe({
      next: (res) => {
        console.log('✅ Institución eliminada', res);
        this.router.navigate(['/dashboard-profile']);
      },
      error: (err) => console.error('❌ Error eliminando institución', err),
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
          this.newLab = { name: '', description: '', location: '', contact_email: '', website: '', research_areas: '' };
        }
      },
      error: (err) => console.error('❌ Error creando laboratorio', err),
    });
  }
}
