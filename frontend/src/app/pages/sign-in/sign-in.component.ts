import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LogoComponent } from '../../shared/ui/logo/logo.component';
import { BackArrowComponent } from '../../shared/ui/back-arrow/back-arrow.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink,
    LogoComponent,
    BackArrowComponent,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly countdown = signal<number>(0);

  protected readonly signInForm = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ],
    ],
    password: ['', [Validators.required]],
  });

  protected onSignIn(): void {
    if (this.countdown() > 0) return;

    if (this.signInForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const { email, password } = this.signInForm.value;

      this.authService.login(email!, password!).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isLoading.set(false);
          if (error.status === 503 || error.status === 429) {
            this.startCountdown(60);
            this.errorMessage.set(
              'Too many login attempts. Please wait 60 seconds before trying again.',
            );
          } else {
            this.errorMessage.set(
              error.error?.message || 'Login failed. Please check your credentials.',
            );
          }
        },
      });
    }
  }

  private startCountdown(seconds: number): void {
    this.countdown.set(seconds);
    const interval = setInterval(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }
}
