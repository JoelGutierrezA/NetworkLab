import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonSearchbar,
  IonTitle,
  IonToast,
  IonToolbar
} from '@ionic/angular/standalone';
import { BottomTabsComponent } from '../../components/bottom-tabs/bottom-tabs.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonBadge,
    IonToast,
    IonSearchbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,

    BottomTabsComponent,
  ],
  templateUrl: './marketplace.page.html',
  styleUrls: ['./marketplace.page.scss'],
})
export class MarketplacePage {
  categories = ['Equipos', 'Servicios', 'Consumibles', 'Repuestos', 'Soporte'];

  products = [
    { id: 1, name: 'Cámara IP 1080p', description: 'Cámara de alta definición para vigilancia interior/exterior, resolución 1080p.', image: 'https://via.placeholder.com/400x300?text=Camara' },
    { id: 2, name: 'Router Gigabit', description: 'Router con puertos gigabit y soporte de QoS para redes domésticas y PYMES.', image: 'https://via.placeholder.com/400x300?text=Router' },
    { id: 3, name: 'Switch 24 puertos', description: 'Switch administrable de 24 puertos para infraestructuras de red de mediano tamaño.', image: 'https://via.placeholder.com/400x300?text=Switch' },
    { id: 4, name: 'Kit de Herramientas', description: 'Kit con destornilladores, alicates y herramientas básicas para instalación.', image: 'https://via.placeholder.com/400x300?text=Kit' },
    { id: 5, name: 'Fuente 12V', description: 'Fuente de alimentación compacta 12V con protección contra sobrecarga.', image: 'https://via.placeholder.com/400x300?text=Fuente' },
  ];
  cartCount = 2;
  toastOpen = false;
  toastMessage = '';
  private cartAnimating = false;

  constructor(private readonly auth: AuthService) { }

  get isStudent(): boolean {
    try {
      const role = (this.auth.getUser()?.role || '').toString();
      return /student/i.test(role);
    } catch (e) {
      return false;
    }
  }

  viewProduct(product: any): void {
    // placeholder: open read-only view modal or navigate to detail view
    this.toastMessage = `Ver: ${product?.name || 'producto'}`;
    this.toastOpen = true;
  }

  editProduct(product: any): void {
    // placeholder: open edit form / navigate to edit screen
    this.toastMessage = `Editar: ${product?.name || 'producto'}`;
    this.toastOpen = true;
  }

  onOpenCart(): void {
    // trigger simple animation class on the button via DOM
    if (this.cartAnimating) return;
    this.cartAnimating = true;
    const btn = document.querySelector('.cart-button');
    if (btn) btn.classList.add('cart-animate');
    setTimeout(() => {
      if (btn) btn.classList.remove('cart-animate');
      this.cartAnimating = false;
      this.toastMessage = 'Abrir carrito (placeholder)';
      this.toastOpen = true;
    }, 600);
  }
}
