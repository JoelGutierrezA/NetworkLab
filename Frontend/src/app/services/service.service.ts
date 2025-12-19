import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { ServiceItem } from '../models/service-item.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) { }

  getServicesByLab(labId: number): Observable<ApiResponse<ServiceItem[]>> {
    return this.http.get<ApiResponse<ServiceItem[]>>(`${this.apiUrl}/laboratories/${labId}/equipment`);
  }

  createService(labId: number, data: Partial<ServiceItem>): Observable<ApiResponse<ServiceItem>> {
    // Ahora se crea directamente en /equipment incluyendo laboratory_id en el body
    const url = `${this.apiUrl}/equipment`;
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.post<ApiResponse<ServiceItem>>(url, { ...data, laboratory_id: labId }, { headers });
    }
    return this.http.post<ApiResponse<ServiceItem>>(url, { ...data, laboratory_id: labId });
  }

  // optional: fetch all services
  getAllServices(): Observable<ApiResponse<ServiceItem[]>> {
    return this.http.get<ApiResponse<ServiceItem[]>>(`${this.apiUrl}/equipment`);
  }

  updateService(id: number, data: Partial<ServiceItem>): Observable<ApiResponse<ServiceItem>> {
    const url = `${this.apiUrl}/equipment/${id}`;
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.put<ApiResponse<ServiceItem>>(url, data, { headers });
    }
    return this.http.put<ApiResponse<ServiceItem>>(url, data);
  }

  deleteService(id: number): Observable<ApiResponse<null>> {
    const url = `${this.apiUrl}/equipment/${id}`;
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.delete<ApiResponse<null>>(url, { headers });
    }
    return this.http.delete<ApiResponse<null>>(url);
  }
}
