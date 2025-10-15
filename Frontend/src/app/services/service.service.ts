import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) {}

  getServicesByLab(labId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/laboratories/${labId}/equipment`);
  }

  createService(labId: number, data: any): Observable<ApiResponse<any>> {
  // Ahora se crea directamente en /equipment incluyendo laboratory_id en el body
  const url = `${this.apiUrl}/equipment`;
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.post<ApiResponse<any>>(url, { ...data, laboratory_id: labId }, { headers });
    }
    return this.http.post<ApiResponse<any>>(url, { ...data, laboratory_id: labId });
  }

  // optional: fetch all services
  getAllServices() {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/equipment`);
  }

  updateService(id: number, data: any): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/equipment/${id}`;
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.put<ApiResponse<any>>(url, data, { headers });
    }
    return this.http.put<ApiResponse<any>>(url, data);
  }

  deleteService(id: number): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/equipment/${id}`;
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.delete<ApiResponse<any>>(url, { headers });
    }
    return this.http.delete<ApiResponse<any>>(url);
  }
}
