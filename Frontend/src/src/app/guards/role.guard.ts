import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['expectedRole'];
    const userRole = localStorage.getItem('role');

    if (userRole === expectedRole) {
      return true;
    }

    // Si no cumple el rol, lo mando al dashboard normal
    this.router.navigate(['/dashboard']);
    return false;
  }
}
