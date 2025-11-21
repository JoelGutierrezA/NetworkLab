import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Post {
  id: number;
  user_id?: number;
  title?: string;
  body: string;
  created_at?: string;
  author?: { id: number; first_name: string; last_name: string };
}

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly api = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  // Try to fetch posts from backend; if fails (no endpoint) return mock data
  getPosts(page = 1): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.api}/posts?page=${page}`);
  }

  createPost(payload: { body: string; title?: string }): Observable<Post> {
    return this.http.post<Post>(`${this.api}/posts`, payload);
  }

  // Fallback mock helpers (not used by default)
  mockPosts(): Observable<Post[]> {
    const now = new Date().toISOString();
    const data: Post[] = [
      { id: 1, body: 'Bienvenido a NetworkLab. Comparte actualizaciones y recursos.', created_at: now, author: { id: 2, first_name: 'María', last_name: 'González' } },
      { id: 2, body: 'Recordatorio: seminario de microscopía este viernes.', created_at: now, author: { id: 3, first_name: 'Pedro', last_name: 'Ruiz' } }
    ];
    return of(data);
  }
}
