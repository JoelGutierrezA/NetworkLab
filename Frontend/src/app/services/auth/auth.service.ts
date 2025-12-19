import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, finalize, map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../../models/auth-response.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Interfaces para el registro
export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Interfaz común para User
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient,
    private readonly router: Router
  ) { }

  login(dto: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, dto);
  }

  // MÉTODO REGISTER
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, userData).pipe(
      tap((response: RegisterResponse) => {
      })
    );
  }

  refreshToken(): Observable<string> {
    this._isRefreshing.next(true);
    return this.http.post<{ token: string; user?: User }>(
      `${this.apiUrl}/auth/refresh`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      }
    ).pipe(
      map(response => {
        const newToken = response.token;
        if (newToken) {
          localStorage.setItem('token', newToken);
        }
        // Si el backend devuelve también el user actualizado, guardarlo
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        return newToken;
      }),
      finalize(() => this._isRefreshing.next(false))
    );
  }

  // Observable público para indicar cuando se está intentando un refresh
  private readonly _isRefreshing = new BehaviorSubject<boolean>(false);
  public readonly isRefreshing$ = this._isRefreshing.asObservable();

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  // Método adicional para verificar roles
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user && user.role === role;
  }

  // Método para obtener el rol actual
  getCurrentRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
