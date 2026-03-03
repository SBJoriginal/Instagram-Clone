<<<<<<< HEAD
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
=======
import { Component, inject, signal, OnInit } from '@angular/core';
>>>>>>> fc50ac54b18e06cb940f04128749fae69b98c449
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
import { HttpErrorResponse } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { PasswordValidators } from '../../validators/password.validators';
<<<<<<< HEAD
import { GoogleAuthService } from '../../services/google-auth.service';
=======
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProfileService } from '../../services/profile.service';
>>>>>>> fc50ac54b18e06cb940f04128749fae69b98c449

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
    MatIconModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
<<<<<<< HEAD
export class SignUpComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly googleAuth = inject(GoogleAuthService);
=======
export class SignUpComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
>>>>>>> fc50ac54b18e06cb940f04128749fae69b98c449

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected hidePassword = true;

  protected readonly signUpForm = this.fb.group(
    {
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          PasswordValidators.minLength(6),
          PasswordValidators.hasNumber(),
          PasswordValidators.hasUpperCase(),
          PasswordValidators.hasLowerCase(),
          PasswordValidators.hasSpecialCharacter(),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator },
  );

<<<<<<< HEAD
  ngAfterViewInit(): void {
    this.googleAuth.initialize('google-btn-signup', '/complete-profile', this.errorMessage);
=======
  ngOnInit(): void {
    this.signUpForm
      .get('email')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        const emailControl = this.signUpForm.get('email')!;
        if (emailControl.value && emailControl.valid) {
          this.profileService.checkEmailAvailability(emailControl);
        }
      });
>>>>>>> fc50ac54b18e06cb940f04128749fae69b98c449
  }

  protected isRequirementMet(errorName: string): boolean {
    const passwordControl = this.signUpForm.controls.password;
    if (passwordControl.hasError('required')) {
      return false;
    }
    return !passwordControl.hasError(errorName);
  }

  protected onSignUp(): void {
    if (this.signUpForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const { email, password } = this.signUpForm.getRawValue();

      this.authService.register(email!, password!).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/complete-profile']);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading.set(false);

          if (error.status === 409) {
            this.errorMessage.set(
              'This email is already registered. Please sign in or use a different email.',
            );
          } else {
            this.errorMessage.set(
              error.error?.message ||
                error.error?.detail ||
                'Registration failed. Please try again.',
            );
          }
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
