import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Puede venir como un string único...
    const expectedRole = route.data['expectedRole'];
    // ...o como un arreglo de roles permitidos
    const allowedRoles: string[] | undefined = route.data['allowedRoles'];

    // 1) intenta leer el rol plano
    let role: string | null = localStorage.getItem('role');

    // 2) si no existe, intenta desde el objeto user
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

    // si no cumple, lo mando al dashboard normal
    this.router.navigate(['/dashboard']);
    return false;
    }
}
