import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) {}

  // Usuarios
  getUsuarios(page: number, pageSize: number): Observable<{ usuarios: User[], total: number }> {
    return this.http.get<{ usuarios: User[], total: number }>(
      `${this.apiUrl}/users?page=${page}&pageSize=${pageSize}`
    );
  }

  // Contraseña
  changePassword(id: number, oldPassword: string, newPassword: string) {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/users/${id}/password`,
      { oldPassword, newPassword }
    );
  }

  // Instituciones
  getInstitutions() {
    return this.http.get<{ success: boolean; institutions: any[] }>(
      `${this.apiUrl}/institutions`
    );
  }

  getInstitutionById(id: number) {
    return this.http.get<{ success: boolean; institution: any }>(
      `${this.apiUrl}/institutions/${id}`
    );
  }

  createInstitution(data: any) {
    return this.http.post<{ success: boolean; id: number; message: string }>(
      `${this.apiUrl}/institutions`,
      data
    );
  }

  updateInstitution(id: number, data: any) {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/institutions/${id}`,
      data
    );
  }

  deleteInstitution(id: number) {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/institutions/${id}`
    );
  }

}
