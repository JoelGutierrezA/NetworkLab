import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderDashboardComponent } from '../../shared/header-dashboard/header-dashboard.component';

interface Supplier {
  id: number;
  name: string;
  product: string;
  brand: string;
  country: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-dashboard-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderDashboardComponent, FooterComponent],
  templateUrl: './dashboard-suppliers.component.html',
  styleUrls: ['./dashboard-suppliers.component.css']
})
export class DashboardSuppliersComponent implements OnInit {

  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];

  searchTerm: string = '';
  selectedBrand: string = '';
  selectedCountry: string = '';

  brands: string[] = [];
  countries: string[] = [];

  ngOnInit(): void {
    // Datos simulados (mock)
    this.suppliers = [
      {
        id: 1,
        name: 'BioTech Instruments',
        product: 'Microscopio Electrónico',
        brand: 'Thermo Fisher',
        country: 'Chile',
        description: 'Proveedor líder de equipos de laboratorio de alta precisión.',
        image: 'https://images.unsplash.com/photo-1581091870633-1d6b6fca0b56?auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 2,
        name: 'LabSolutions Ltda.',
        product: 'Centrífuga de Laboratorio',
        brand: 'Eppendorf',
        country: 'Argentina',
        description: 'Equipos para biología molecular y análisis clínico.',
        image: 'https://images.unsplash.com/photo-1582719478181-2f06c12e3a2f?auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 3,
        name: 'AndesChem',
        product: 'Reactivos Químicos',
        brand: 'Sigma Aldrich',
        country: 'Chile',
        description: 'Distribuidor autorizado de productos químicos de laboratorio.',
        image: 'https://images.unsplash.com/photo-1582560475093-2f9b55f17cf5?auto=format&fit=crop&w=800&q=60'
      },
      {
        id: 4,
        name: 'NanoLab Group',
        product: 'Nanopartículas de oro',
        brand: 'Nanocs',
        country: 'Perú',
        description: 'Especialistas en materiales avanzados para investigación.',
        image: 'https://images.unsplash.com/photo-1622202173051-7e6a4c0c7ee3?auto=format&fit=crop&w=800&q=60'
      }
    ];

    this.filteredSuppliers = [...this.suppliers];
    this.brands = [...new Set(this.suppliers.map(s => s.brand))];
    this.countries = [...new Set(this.suppliers.map(s => s.country))];
  }

  filterSuppliers(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredSuppliers = this.suppliers.filter(s =>
      (s.name.toLowerCase().includes(term) ||
        s.product.toLowerCase().includes(term) ||
        s.brand.toLowerCase().includes(term)) &&
      (this.selectedBrand ? s.brand === this.selectedBrand : true) &&
      (this.selectedCountry ? s.country === this.selectedCountry : true)
    );
  }
}
