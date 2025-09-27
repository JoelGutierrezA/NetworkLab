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

  // Obtener lista de usuarios con paginación
  getUsuarios(page: number, pageSize: number): Observable<{ usuarios: User[], total: number }> {
    return this.http.get<{ usuarios: User[], total: number }>(
      `${this.apiUrl}/users?page=${page}&pageSize=${pageSize}`
    );
  }

  // Cambiar contraseña de un usuario
  changePassword(id: number, oldPassword: string, newPassword: string) {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/users/${id}/password`,
      { oldPassword, newPassword }
    );
  }

  updateUserInstitution(userId: number, institutionId: number, roleId?: number) {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/users/${userId}/institution`,
      { institutionId, roleId }
    );
  }

  getInstitutions() {
    return this.http.get<{ success: boolean; institutions: any[] }>(
      `${this.apiUrl}/institutions`
    );
  }
}
