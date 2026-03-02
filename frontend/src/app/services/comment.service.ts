import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment, CreateComment } from '../models/comment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Comment`;

  addComment(comment: CreateComment): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment);
  }

  getComments(imageId: number, page = 1, pageSize = 10): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/image/${imageId}`, {
      params: { page, pageSize },
    });
  }
}
