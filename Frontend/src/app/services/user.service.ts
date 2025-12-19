import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Institution } from '../models/institution.model';
import { Laboratory } from '../models/laboratory.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) { }

  // USUARIOS
  getUsuarios(page: number, pageSize: number): Observable<{ usuarios: User[]; total: number }> {
    return this.http.get<{ usuarios: User[]; total: number }>(
      `${this.apiUrl}/users?page=${page}&pageSize=${pageSize}`
    );
  }

  getUsuarioById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/${id}`);
  }

  updateUser(id: number, data: Partial<User>): Observable<ApiResponse<null>> {
    const url = `${this.apiUrl}/users/${id}`;
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.put<ApiResponse<null>>(url, data, { headers });
    }
    return this.http.put<ApiResponse<null>>(url, data);
  }

  deleteUser(id: number): Observable<ApiResponse<null>> {
    const url = `${this.apiUrl}/users/${id}`;
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.delete<ApiResponse<null>>(url, { headers });
    }
    return this.http.delete<ApiResponse<null>>(url);
  }

  // CONTRASEÑA
  changePassword(id: number, oldPassword: string, newPassword: string): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/users/${id}/password`, {
      oldPassword,
      newPassword,
    });
  }

  // INSTITUCIONES
  getInstitutions(): Observable<ApiResponse<Institution[]>> {
    return this.http.get<ApiResponse<Institution[]>>(`${this.apiUrl}/institutions`);
  }

  getInstitutionById(id: number): Observable<ApiResponse<Institution>> {
    return this.http.get<ApiResponse<Institution>>(`${this.apiUrl}/institutions/${id}`);
  }

  createInstitution(data: Partial<Institution>): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/institutions`, data);
  }

  updateInstitution(id: number, data: Partial<Institution>): Observable<ApiResponse<null>> {
    const url = `${this.apiUrl}/institutions/${id}`;
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.put<ApiResponse<null>>(url, data, { headers });
    }
    return this.http.put<ApiResponse<null>>(url, data);
  }

  deleteInstitution(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/institutions/${id}`);
  }

  // LABORATORIOS
  getAllLaboratories(): Observable<ApiResponse<Laboratory[]>> {
    return this.http.get<ApiResponse<Laboratory[]>>(
      `${this.apiUrl}/laboratories`
    );
  }

  getLaboratoriesByInstitution(institutionId: number): Observable<ApiResponse<Laboratory[]>> {
    return this.http.get<ApiResponse<Laboratory[]>>(
      `${this.apiUrl}/institutions/${institutionId}/laboratories`
    );
  }

  createLaboratory(institutionId: number, labData: Partial<Laboratory>): Observable<ApiResponse<null>> {
    const url = `${this.apiUrl}/institutions/${institutionId}/laboratories`;

    // Fallback: si por alguna razón el interceptor no adjunta la cabecera,
    // intentar leer el token directamente desde localStorage y adjuntarlo aquí.
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.post<ApiResponse<null>>(url, labData, { headers });
    }

    return this.http.post<ApiResponse<null>>(url, labData);
  }

  updateLaboratory(laboratoryId: number, labData: Partial<Laboratory>): Observable<ApiResponse<null>> {
    const url = `${this.apiUrl}/laboratories/${laboratoryId}`;
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.put<ApiResponse<null>>(url, labData, { headers });
    }
    return this.http.put<ApiResponse<null>>(url, labData);
  }

  deleteLaboratory(laboratoryId: number): Observable<ApiResponse<null>> {
    const url = `${this.apiUrl}/laboratories/${laboratoryId}`;
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.delete<ApiResponse<null>>(url, { headers });
    }
    return this.http.delete<ApiResponse<null>>(url);
  }
}
