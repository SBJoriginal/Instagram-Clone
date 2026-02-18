import { Component, inject, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProfileEditData } from '../profile.model';
import { ProfileService } from '../../../services/profile.service';
import { debounceTime, distinctUntilChanged, take } from 'rxjs';

@Component({
  selector: 'app-profile-edit',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profile_edit.component.html',
  styleUrls: ['./profile_edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ProfileEditComponent>);
  public data: ProfileEditData = inject(MAT_DIALOG_DATA);
  private profileService = inject(ProfileService);
  protected readonly generalError = signal<string | null>(null);
  protected readonly isSaving = signal(false);

  tempAvatarUrl = signal<string | null>(this.data.avatarUrl);
  selectedFile = signal<File | null>(null);

  editForm = this.fb.group({
    username: [this.data.username, [Validators.required]],
    firstName: [
      this.data.firstName,
      [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)],
    ],
    lastName: [this.data.lastName, [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)]],
    email: [
      this.data.email,
      [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)],
    ],
    phone: [
      this.data.phone?.includes('X') ? '' : this.data.phone,
      [Validators.required, Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)],
    ],
  });

  ngOnInit(): void {
    this.editForm.get('username')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.profileService.checkUsernameAvailability(
        this.editForm.get('username')!,
        this.data.username
      );
    });

    this.editForm.get('email')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.profileService.checkEmailAvailability(
        this.editForm.get('email')!,
        this.data.email
      );
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        this.tempAvatarUrl.set(url);
      };
      reader.readAsDataURL(file);
    }
  }

  onPhoneInput(event: Event): void {
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

    this.editForm.controls.phone.setValue(formattedValue, { emitEvent: false });
    input.value = formattedValue;
    this.editForm.controls.phone.markAsTouched();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editForm.valid && !this.isSaving()) {
      this.isSaving.set(true);
      this.generalError.set(null);

      const profileData = {
        username: this.editForm.value.username!,
        firstName: this.editForm.value.firstName!,
        lastName: this.editForm.value.lastName!,
        email: this.editForm.value.email!,
        phoneNumber: this.editForm.value.phone!,
      };

      this.profileService.updateProfile(profileData).subscribe({
        next: () => {
          const file = this.selectedFile();
          if (file) {
            this.profileService.uploadProfilePicture(file).subscribe({
              next: (response) => {
                this.isSaving.set(false);
                this.dialogRef.close({ success: true });
              },
              error: (err) => {
                this.isSaving.set(false);
                this.generalError.set('Failed to upload image');
              },
            });
          } else {
            this.isSaving.set(false);
            this.dialogRef.close({ success: true });
          }
        },
        error: (err) => {
          this.isSaving.set(false);

          const errorDetail = err.error?.detail || '';

          if (errorDetail.toLowerCase().includes('username')) {
            this.editForm.get('username')?.setErrors({ taken: true });
          } else if (errorDetail.toLowerCase().includes('email')) {
            this.editForm.get('email')?.setErrors({ taken: true });
          } else {
            this.generalError.set('Failed to update profile. Please try again.');
          }
        },
      });
    }
  }

  private originalValues = {
    username: this.data.username,
    firstName: this.data.firstName,
    lastName: this.data.lastName,
    email: this.data.email,
    phone: this.data.phone?.includes('X') ? '' : this.data.phone,
  };

  onFieldFocus(fieldName: string): void {
    const control = this.editForm.get(fieldName);
    const currentValue = control?.value;
    if (control?.hasError('taken')) {
      control.statusChanges.pipe(
        take(1)
      ).subscribe(() => {
      });
    }

    if (currentValue === this.originalValues[fieldName as keyof typeof this.originalValues]) {
      control?.setValue('');
    }
  }

  onFieldBlur(fieldName: string): void {
    const control = this.editForm.get(fieldName);
    const currentValue = control?.value;

    if (!currentValue || currentValue.trim() === '') {
      control?.setValue(this.originalValues[fieldName as keyof typeof this.originalValues]);
    }
  }
}
