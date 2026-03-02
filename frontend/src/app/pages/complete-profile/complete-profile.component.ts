import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProfileRequest } from '../../models/auth.models';
import { ProfileService } from '../../services/profile.service';
import { TokenService } from '../../services/token.service';
import { BackArrowComponent } from '../../shared/ui/back-arrow/back-arrow.component';
import { LogoComponent } from '../../shared/ui/logo/logo.component';

@Component({
  selector: 'app-complete-profile',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    BackArrowComponent,
    LogoComponent,
  ],
  templateUrl: './complete-profile.component.html',
  styleUrl: './complete-profile.component.css',
})
export class CompleteProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly profileService = inject(ProfileService);
  private readonly tokenService = inject(TokenService);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly profileAlreadyExists = signal(false);

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: () => {
        this.profileAlreadyExists.set(true);
        this.errorMessage.set('A profile already exists for your account. Please sign in instead.');
      },
      error: () => {
        // 404 = no profile yet, show the form normally
      },
    });
  }

  protected readonly profileForm = this.fb.group({
    username: ['', [Validators.required]],
    firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)]],
    lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]],
  });

  protected onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 10) {
      value = value.substring(0, 10);
    }

    let formattedValue = '';
    if (value.length > 0) {
      formattedValue = value.substring(0, 3);
      if (value.length > 3) {
        formattedValue += '-' + value.substring(3, 6);
      }
      if (value.length > 6) {
        formattedValue += '-' + value.substring(6, 10);
      }
    }

    this.profileForm.controls.phoneNumber.setValue(formattedValue, { emitEvent: false });
    input.value = formattedValue;
    this.profileForm.controls.phoneNumber.markAsTouched();
  }

  protected onSubmit(): void {
    if (this.profileForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const profileData: ProfileRequest = {
        username: this.profileForm.getRawValue().username!,
        firstName: this.profileForm.getRawValue().firstName!,
        lastName: this.profileForm.getRawValue().lastName!,
        phoneNumber: this.profileForm.getRawValue().phoneNumber!,
        email: this.tokenService.getEmailFromToken() || '',
      };

      this.profileService.completeProfile(profileData).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/home']);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading.set(false);
          if (error.status === 409) {
            this.errorMessage.set(
              'A profile already exists for your account. Please sign in instead.',
            );
          } else if (error.status === 400) {
            this.errorMessage.set(
              error.error?.message || 'Invalid profile data. Please check your inputs.',
            );
          } else {
            this.errorMessage.set('Failed to complete profile. Please try again.');
          }
        },
      });
    }
  }
}
