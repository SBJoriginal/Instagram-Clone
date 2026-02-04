import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { BackArrowComponent } from '../../shared/ui/back-arrow/back-arrow.component';
import { LogoComponent } from '../../shared/ui/logo/logo.component';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { PasswordValidators } from '../../validators/password.validators';

@Component({
  selector: 'app-sign-up',
  imports: [
    BackArrowComponent,
    LogoComponent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    RouterLink,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly signUpForm = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          PasswordValidators.minLength(6),
          PasswordValidators.hasUpperCase(),
          PasswordValidators.hasLowerCase(),
          PasswordValidators.hasSpecialCharacter(),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator },
  );

  protected onSignUp(): void {
    if (this.signUpForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const { email, password } = this.signUpForm.value;

      this.authService.register(email!, password!).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/complete-profile']);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Registration failed. Please try again.');
        },
      });
    }
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
}
