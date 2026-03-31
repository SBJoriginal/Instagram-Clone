import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReactionResponse {
  isReacted: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ReactionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  toggleReaction(imageId: number): Observable<ReactionResponse> {
    return this.http.post<ReactionResponse>(`${this.apiUrl}/images/${imageId}/reactions`, {});
  }
}
