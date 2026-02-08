import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfileRequest, ProfileResponse } from '../models/auth.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Profile`;

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(this.apiUrl);
  }

  updateProfile(profile: ProfileRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/update-profile`, profile);
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

  getProfilePicture(): Observable<{ profilePictureUrl: string; imageId: number }> {
    return this.http.get<{ profilePictureUrl: string; imageId: number }>(
      `${this.apiUrl}/profile-picture`,
    );
  }

  deleteProfilePicture(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/profile-picture`);
  }
}
