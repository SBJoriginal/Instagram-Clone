import { Injectable, signal } from '@angular/core';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface DecodedToken {
  sub?: string;
  email?: string;
  exp?: number;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly hasToken = signal(!!this.getAccessToken());

  isAuthenticated = this.hasToken.asReadonly();

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this.hasToken.set(true);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.hasToken.set(false);
  }

  decodeToken(token: string): DecodedToken | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded) as DecodedToken;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded?.exp) {
      return true;
    }

    const expirationDate = new Date(decoded.exp * 1000);
    return expirationDate < new Date();
  }

  getUserIdFromToken(): string | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    const decoded = this.decodeToken(token);
    return decoded?.sub ?? null;
  }

  getEmailFromToken(): string | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    const decoded = this.decodeToken(token);
    return decoded?.email ?? null;
  }
}
