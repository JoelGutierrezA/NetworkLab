import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) {}

  getUsers(limit = 10, offset = 0): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/users?limit=${limit}&offset=${offset}`);
  }
}
