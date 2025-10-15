import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.model';

export interface SupplierDTO {
  id?: number;
  name: string;
  description?: string;
  website?: string;
  country?: string;
  city?: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class SupplierService {
  // Usar la URL base desde environment
  private readonly base = `${environment.apiUrl}/suppliers`;
  constructor(private readonly http: HttpClient) {}

  list(): Observable<ApiResponse<SupplierDTO[]>> {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.get<ApiResponse<SupplierDTO[]>>(this.base, { headers });
    }
    return this.http.get<ApiResponse<SupplierDTO[]>>(this.base);
  }

  get(id: number): Observable<ApiResponse<SupplierDTO>> {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.get<ApiResponse<SupplierDTO>>(`${this.base}/${id}`, { headers });
    }
    return this.http.get<ApiResponse<SupplierDTO>>(`${this.base}/${id}`);
  }

  create(payload: SupplierDTO): Observable<ApiResponse<SupplierDTO>> {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.post<ApiResponse<SupplierDTO>>(this.base, payload, { headers });
    }
    return this.http.post<ApiResponse<SupplierDTO>>(this.base, payload);
  }

  // Create supplier together with an admin user (admin-only endpoint)
  createWithAdmin(provider: SupplierDTO, admin: { email: string; password: string; username?: string; first_name?: string; last_name?: string; phone?: string; avatar_url?: string }): Observable<ApiResponse<any>> {
    const url = `${environment.apiUrl}/admin/suppliers`;
    const body = { provider, admin };
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.post<ApiResponse<any>>(url, body, { headers });
    }
    return this.http.post<ApiResponse<any>>(url, body);
  }

  update(id: number, payload: SupplierDTO): Observable<ApiResponse<SupplierDTO>> {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.put<ApiResponse<SupplierDTO>>(`${this.base}/${id}`, payload, { headers });
    }
    return this.http.put<ApiResponse<SupplierDTO>>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.delete<ApiResponse<null>>(`${this.base}/${id}`, { headers });
    }
    return this.http.delete<ApiResponse<null>>(`${this.base}/${id}`);
  }
}
