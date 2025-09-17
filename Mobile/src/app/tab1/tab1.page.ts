import { Component, OnInit } from '@angular/core'; // ← Agregar OnInit
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule,  ExploreContainerComponent],
})
export class Tab1Page implements OnInit { // ← Implementar OnInit

  constructor(private authService: AuthService) {}

  ngOnInit() { // ← Agregar este método
    console.log('✅ AuthService cargado correctamente');
    console.log('API URL:', this.authService.apiUrl);

    // Opcional: probar el método getToken()
    const token = this.authService.getToken();
    console.log('Token actual:', token);
  }
}
