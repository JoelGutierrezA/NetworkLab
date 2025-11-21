import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
    };
    token: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
    tap((response: any) => {
      if (response?.success) {
          // Backend may return token/user at top-level or under `data`.
          const token = response?.token ?? response?.data?.token;
          const user = response?.user ?? response?.data?.user;
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

  getUser(): any {
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
  changePassword(payload: { current_password: string; new_password: string; }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/change-password`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      }
    );
  }

  /**
   * Update current user's profile. Payload can include editable fields like username, phone, etc.
   * On success updates localStorage user copy.
   */
  updateProfile(payload: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/users/me`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      }
    ).pipe(
      tap((res: any) => {
        // Backend may return updated user under res.data or res.user
        const updated = res?.data?.user ?? res?.user ?? res?.data ?? res;
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
