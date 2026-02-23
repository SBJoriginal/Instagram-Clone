import { inject, Injectable, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

interface GoogleButtonOptions {
  theme: string;
  size: string;
  width: number;
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: { credential: string }) => void;
}

interface GoogleIdentityServices {
  accounts: {
    id: {
      initialize: (config: GoogleIdConfig) => void;
      renderButton: (element: HTMLElement | null, options: GoogleButtonOptions) => void;
    };
  };
}

declare const google: GoogleIdentityServices;

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  initialize(
    elementId: string,
    redirectPath: string,
    errorSignal: WritableSignal<string | null>,
  ): void {
    if (typeof google === 'undefined') return;

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => {
        this.handleResponse(response.credential, redirectPath, errorSignal);
      },
    });

    google.accounts.id.renderButton(document.getElementById(elementId), {
      theme: 'outline',
      size: 'large',
      width: 300,
    });
  }

  private handleResponse(
    credential: string,
    redirectPath: string,
    errorSignal: WritableSignal<string | null>,
  ): void {
    errorSignal.set(null);
    this.authService.loginWithGoogle(credential).subscribe({
      next: () => this.router.navigate([redirectPath]),
      error: (error: { error?: { message?: string } }) => {
        errorSignal.set(error.error?.message ?? 'Google login failed. Please try again.');
      },
    });
  }
}
