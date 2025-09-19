import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Clonar request con token
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 (Unauthorized) y hay token
      if (error.status === 401 && token) {
        // Intentar refresh del token
        return authService.refreshToken().pipe(
          switchMap((newToken: string) => {
            // Reintentar la request original con el nuevo token
            const newRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(newRequest);
          }),
          catchError((refreshError) => {
            // Si el refresh falla, hacer logout
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }

      // Para otros errores, simplemente relanzar
      return throwError(() => error);
    })
  );
};
