import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ServiceItem {
  id: number;
  name: string;
  description?: string | null;
  laboratory_id?: number | null;
  model?: string | null;
  manufacturer?: string | null;
  requires_training?: boolean | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ServicesApiService {
  private readonly base = 'http://localhost:3000/api/equipment';

  constructor(private readonly http: HttpClient) { }

  list(): Observable<ServiceItem[]> {
    // Backend returns { success: boolean, data: ServiceItem[] }
    return this.http.get<{ success: boolean; data?: ServiceItem[] }>(this.base)
      .pipe(map(res => res?.data || []));
  }

  listByLab(labId: number): Observable<ServiceItem[]> {
    const url = `http://localhost:3000/api/laboratories/${labId}/equipment`;
    return this.http.get<{ success: boolean; data?: ServiceItem[] }>(url)
      .pipe(map(res => res?.data || []));
  }

  create(item: { name: string; description?: string }): Observable<ServiceItem> {
    return this.http.post<{ success: boolean; data?: ServiceItem }>(this.base, item)
      .pipe(map(res => res?.data as ServiceItem));
  }

  update(id: number, item: Partial<ServiceItem>): Observable<{ success: boolean; message?: string; data?: ServiceItem }> {
    const url = `${this.base}/${id}`;
    return this.http.put<{ success: boolean; message?: string; data?: ServiceItem }>(url, item);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<{ success: boolean; message?: string }>(`${this.base}/${id}`)
      .pipe(map(res => res));
  }
}
