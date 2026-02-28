import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ImagePost } from '../models/image.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/profile/all`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile/${id}`);
  }

  getUserImages(id: string): Observable<ImagePost[]> {
    return this.http.get<ImagePost[]>(`${this.apiUrl}/profile/${id}/images`);
  }

  getUsernameAutocomplete(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/profile/autocomplete`, {
      params: {
        query: query,
      },
    });
  }
}
