import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';

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
  // Legacy support for top-level returns
  token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        if (response?.success) {
          // Backend may return token/user at top-level or under `data`.
          const token = response.token ?? response.data?.token;
          const user = response.user ?? response.data?.user;
          if (token) {
            localStorage.setItem('token', token);
          }
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
      })
    );
  }

  refreshToken(): Observable<string> {
    return this.http.post<{ token: string }>(
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
        localStorage.setItem('token', newToken);
        return newToken;
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Change user password. Expects payload: { current_password, new_password }
   * Returns observable from backend. Caller handles subscription and UI.
   */
  changePassword(payload: { current_password: string; new_password: string; }): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${this.apiUrl}/auth/change-password`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      }
    );
  }

  updateProfile(payload: Partial<User>): Observable<ApiResponse<User>> {
    const user = this.getUser();
    if (!user?.id) return new Observable(observer => observer.error('User not found'));
    return this.http.put<ApiResponse<User>>(
      `${this.apiUrl}/users/${user.id}`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      }
    ).pipe(
      tap((res) => {
        // Backend may return updated user under res.data or res.user
        // With strict types we expect it in res.user (from controller) or res.data (if standardized)
        // Our controller currently returns { success: true, user: ... }
        const updated = res.data ?? (res as any).user;
        if (updated) {
          // merge with existing stored user
          const current = this.getUser() || {};
          const merged = { ...current, ...updated };
          localStorage.setItem('user', JSON.stringify(merged));
        }
      })
    );
  }
}
