import { Routes } from '@angular/router';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { HomeComponent } from './home/home.component';

// Dashboard Components
import { DashboardProfileComponent } from './components/dashboard/dashboard-profile/dashboard-profile.component';
import { InstitutionComponent } from './components/dashboard/dashboard-profile/institution-detail/institution.component';
import { SuppliersDetailComponent } from './components/dashboard/dashboard-profile/suppliers-detail/suppliers-detail.component';
import { UserComponent } from './components/dashboard/dashboard-profile/user-detail/user.component';
import { DashboardServicesComponent } from './components/dashboard/dashboard-services/dashboard-services.component';
import { DashboardSuppliersComponent } from './components/dashboard/dashboard-suppliers/dashboard-suppliers.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  // Rutas PÚBLICAS
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'access-denied', component: AccessDeniedComponent },

  // Rutas PRIVADAS
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  // admin-dashboard eliminado; usar dashboard-profile (tab Métricas)
  {
    path: 'dashboard-suppliers',
    component: DashboardSuppliersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard-profile',
    component: DashboardProfileComponent,
    canActivate: [AuthGuard]
  },

  // Detalle de proveedor (admin)
  {
    path: 'dashboard-profile/supplier/:id',
    component: SuppliersDetailComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'dashboard-services',
    component: DashboardServicesComponent,
    canActivate: [AuthGuard]
  },

  // 🔑 Detalle de institución (solo admin)
  {
    path: 'dashboard-profile/institution/:id',
    component: InstitutionComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'admin' }
  },

  {
    path: 'dashboard-profile/user/:id',
    component: UserComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'admin' }
  },

  // Redirecciones
  { path: '**', redirectTo: 'home' }
];
