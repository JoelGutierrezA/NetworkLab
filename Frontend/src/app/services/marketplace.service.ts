import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class MarketplaceService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  // Catálogo general (ajusta el endpoint a tu backend)
  getCatalog(params?: { q?: string; category?: string }): Observable<Product[]> {
    const url = `${this.apiUrl}/marketplace/catalog`;
    // Angular's HttpClient params accepts { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }
    // We cast to any or Record<string, any> only if strictly necessary, but better to type it properly.
    return this.http.get<Product[]>(url, { params: params as any });
  }
}
