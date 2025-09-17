import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // 1. Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // 2. Obtener el usuario actual
    const currentUser = this.authService.getUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    // 3. Obtener los roles permitidos de la ruta
    const allowedRoles = route.data['allowedRoles'] as string[];

    // 4. Si no hay roles definidos, permitir acceso
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    // 5. Verificar si el usuario tiene uno de los roles permitidos
    const hasRequiredRole = allowedRoles.includes(currentUser.role);

    if (hasRequiredRole) {
      return true;
    } else {
      // 6. Redirigir a una página de acceso denegado o al dashboard
      this.router.navigate(['/access-denied']);
      return false;
    }
  }
}
