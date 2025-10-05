import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  id?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) {}

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
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/users/${id}`, data);
  }

  deleteUser(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/users/${id}`);
  }

  // CONTRASEÑA
  changePassword(id: number, oldPassword: string, newPassword: string): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/users/${id}/password`, {
      oldPassword,
      newPassword,
    });
  }

  // INSTITUCIONES
  getInstitutions(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/institutions`);
  }

  getInstitutionById(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/institutions/${id}`);
  }

  createInstitution(data: any): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/institutions`, data);
  }

  updateInstitution(id: number, data: any): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/institutions/${id}`, data);
  }

  deleteInstitution(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/institutions/${id}`);
  }

  // LABORATORIOS
  getLaboratoriesByInstitution(institutionId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/institutions/${institutionId}/laboratories`
    );
  }

  createLaboratory(institutionId: number, labData: any): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${this.apiUrl}/institutions/${institutionId}/laboratories`,
      labData
    );
  }
}
