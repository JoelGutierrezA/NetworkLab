import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No añadir Authorization para endpoints de autenticación
    const url = req.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/refresh');
    if (isAuthEndpoint) {
      return next.handle(req);
    }

    // Comprobar seguridad para entornos no browser (SSR) antes de usar localStorage
    const hasLocalStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    const token = hasLocalStorage ? localStorage.getItem('token') : null;

    if (token) {
      const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}
