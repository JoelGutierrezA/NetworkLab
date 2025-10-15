import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['expectedRole'];
    const allowedRoles: string[] | undefined = route.data['allowedRoles'];

    let role: string | null = localStorage.getItem('role');

    if (!role) {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        role = user?.role ?? '';
      } catch {
        role = '';
      }
    }

    // normaliza
    role = String(role || '').toLowerCase().trim();

    // Lógica de autorización
    if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
      const allowed = allowedRoles.map(r => String(r).toLowerCase().trim());
      if (allowed.includes(role)) return true;
    } else if (typeof expectedRole === 'string' && expectedRole.length > 0) {
      const exp = expectedRole.toLowerCase().trim();
      if (role === exp) return true;
    } else {
      // si no se configuró nada en data, por defecto no bloquea
      return true;
    }

    // 🚨 Si no cumple, manda a AccessDenied (no al dashboard)
    this.router.navigate(['/access-denied']);
    return false;
  }
}
