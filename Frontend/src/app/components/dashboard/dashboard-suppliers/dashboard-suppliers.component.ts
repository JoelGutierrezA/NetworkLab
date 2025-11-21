import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
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

  // UI: allow add product for all users except role 'student'
  isStudent: boolean = false;
  showAddForm: boolean = false;
  newProduct: any = {
    name: '',
    description: '',
    brand: '',
    price: null,
    supplier: ''
  };

  // Alert visual state
  alertText: string = '';
  alertType: 'info' | 'success' | 'error' = 'info';

  setAlert(type: 'info'|'success'|'error', text: string, autoHideMs = 5000) {
    this.alertType = type;
    this.alertText = text;
    if (autoHideMs > 0) {
      setTimeout(() => {
        this.clearAlert();
      }, autoHideMs);
    }
  }

  clearAlert() {
    this.alertText = '';
    this.alertType = 'info';
  }

  constructor(private readonly authService: AuthService) {}

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

    // detect role
    try {
      const user = this.authService.getUser();
      this.isStudent = !!(user && user.role === 'student');
    } catch (e) {
      this.isStudent = false;
    }
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

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    try {
      if (this.showAddForm) document.body.style.overflow = 'hidden';
      else document.body.style.overflow = '';
    } catch {}
  }

  submitNewProduct() {
    if (!this.newProduct.name) { this.setAlert('error', 'Ingrese el nombre del producto'); return; }
    // crear entrada local (mock) para mostrar en la lista de proveedores/productos
    const newId = Date.now();
    const newItem = {
      id: newId,
      name: this.newProduct.supplier || 'Proveedor',
      product: this.newProduct.name,
      brand: this.newProduct.brand || '',
      country: '',
      description: this.newProduct.description || '',
      image: ''
    };
    this.suppliers.unshift(newItem as any);
    this.filteredSuppliers = [...this.suppliers];
    this.showAddForm = false;
    try { document.body.style.overflow = ''; } catch {}
    this.newProduct = { name: '', description: '', brand: '', price: null, supplier: '' };
    this.setAlert('success', 'Producto creado (localmente). Si deseas persistir en el servidor, conectar la API.');
  }
}
