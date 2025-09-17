import { Routes } from '@angular/router';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { HomeComponent } from './home/home.component';

// Importar componentes básicos (crea estos primero)
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { EquipmentListComponent } from './components/equipment/equipment-list/equipment-list.component';
import { UserProfileComponent } from './components/profile/user-profile/user-profile.component';

export const routes: Routes = [
  // Rutas PÚBLICAS
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'access-denied', component: AccessDeniedComponent },

  // Rutas PRIVADAS - Versión simple (mientras creas la estructura)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    component: AdminDashboardComponent, // ← Componente directo
    canActivate: [AuthGuard, RoleGuard],
    data: { allowedRoles: ['admin', 'lab_manager'] }
  },
  {
    path: 'equipment',
    component: EquipmentListComponent, // ← Componente directo
    canActivate: [AuthGuard, RoleGuard],
    data: { allowedRoles: ['admin', 'lab_manager', 'researcher'] }
  },
  {
    path: 'profile',
    component: UserProfileComponent, // ← Componente directo
    canActivate: [AuthGuard]
  },

  // Redirecciones
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];
