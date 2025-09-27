import { CommonModule } from '@angular/common'; // ← necesario para *ngFor, *ngIf, etc.
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // ← necesario para [(ngModel)]

// Ajusta estas rutas si tu estructura difiere
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
export class DashboardServicesComponent implements OnInit {
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

  ngOnInit(): void {}

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
}
