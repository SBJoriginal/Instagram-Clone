import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import {
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  User,
  GoogleAuthRequest,
} from '../models/auth.models';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  login(email: string, password: string): Observable<AuthResponse> {
    const request: LoginRequest = { email, password };

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        this.tokenService.saveTokens(response.token, response.refreshToken);
      }),
    );
  }

  register(email: string, password: string): Observable<AuthResponse> {
    const request: RegisterRequest = { email, password };

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap((response) => {
        this.tokenService.saveTokens(response.token, response.refreshToken);
      }),
    );
  }

  loginWithGoogle(idToken: string): Observable<AuthResponse> {
    const request: GoogleAuthRequest = { idToken };

    return this.http.post<AuthResponse>(`${this.apiUrl}/google`, request).pipe(
      tap((response) => {
        this.tokenService.saveTokens(response.token, response.refreshToken);
      }),
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const accessToken = this.tokenService.getAccessToken() ?? '';
    const request: RefreshTokenRequest = { refreshToken };

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, request, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .pipe(
        tap((response) => {
          this.tokenService.saveTokens(response.token, response.refreshToken);
        }),
      );
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    const token = this.tokenService.getAccessToken();
    if (!token) {
      return false;
    }

    return !this.tokenService.isTokenExpired(token);
  }

  getCurrentUser(): User | null {
    const userId = this.tokenService.getUserIdFromToken();
    const email = this.tokenService.getEmailFromToken();

    if (!userId || !email) {
      return null;
    }

    return { id: userId, email };
  }
}
