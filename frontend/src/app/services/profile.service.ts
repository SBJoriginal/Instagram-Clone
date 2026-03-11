import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ProfileRequest, ProfileResponse } from '../models/auth.models';
import { environment } from '../../environments/environment';
import { LogService } from './log.service';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LogService);
  private readonly apiUrl = `${environment.apiUrl}/Profile`;

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(this.apiUrl);
  }

  getUserProfile(userId: string): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/${userId}`);
  }

  getUserProfileByUsername(username: string): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/username/${username}`);
  }

  updateProfile(profile: ProfileRequest): Observable<void> {
    this.logger.info('Updating profile for user');
    return this.http.put<void>(this.apiUrl, profile).pipe(
      tap({
        next: () => this.logger.info('Profile update successful'),
        error: (err: unknown) => this.logger.error('Profile update failed', err),
      }),
    );
  }

  completeProfile(profile: ProfileRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/complete-profile`, profile);
  }

  uploadProfilePicture(file: File): Observable<{ profilePictureUrl: string }> {
    this.logger.info('Uploading profile picture');
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<{ profilePictureUrl: string }>(`${this.apiUrl}/profile-picture`, formData)
      .pipe(
        tap({
          next: () => this.logger.info('Profile picture upload successful'),
          error: (err: unknown) => this.logger.error('Profile picture upload failed', err),
        }),
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

  checkUsernameExists(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/username-exists/${username}`);
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/email-exists/${email}`);
  }

  checkUsernameAvailability(control: AbstractControl, currentUsername?: string): void {
    this.checkAvailability(control, (val) => this.checkUsernameExists(val), currentUsername);
  }

  checkEmailAvailability(control: AbstractControl, currentEmail?: string): void {
    this.checkAvailability(control, (val) => this.checkEmailExists(val), currentEmail);
  }

  private checkAvailability(
    control: AbstractControl,
    checkFn: (val: string) => Observable<boolean>,
    currentValue?: string,
  ): void {
    const value = control.value;
    if (!value || value === currentValue) return;

    checkFn(value).subscribe({
      next: (exists) => {
        if (exists) {
          control.setErrors({ ...control.errors, taken: true });
          control.markAsTouched();
        } else {
          this.removeError(control, 'taken');
        }
      },
    });
  }

  private removeError(control: AbstractControl, errorKey: string): void {
    const errors = control.errors;
    if (errors?.[errorKey]) {
      delete errors[errorKey];
      control.setErrors(Object.keys(errors).length ? errors : null);
    }
  }
}
