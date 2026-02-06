import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfileRequest, ProfileResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8081/api/profile';

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(this.apiUrl);
  }

  completeProfile(profile: ProfileRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/complete-profile`, profile);
  }

  uploadProfilePicture(file: File): Observable<{ profilePictureUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ profilePictureUrl: string }>(
      `${this.apiUrl}/profile-picture`,
      formData,
    );
  }

  deleteProfilePicture(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/profile-picture`);
  }
}
