import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  // Rutas PÚBLICAS (acceso sin login)
  { path: 'home', component: HomeComponent }, // ← Landing page pública
  { path: 'login', component: LoginComponent }, // ← Login público

  // Rutas PRIVADAS (requieren autenticación)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard] // ← PROTEGIDA con guard
  },

  // Redirecciones
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // ← Redirige al home público
  { path: '**', redirectTo: '/home' } // ← Rutas desconocidas van al home público
];
