import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProfileEditData } from '../profile.model';
import { ProfileService } from '../../../services/profile.service';

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
export class ProfileEditComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ProfileEditComponent>);
  public data: ProfileEditData = inject(MAT_DIALOG_DATA);
  private profileService = inject(ProfileService);

  tempAvatarUrl = signal<string | null>(this.data.avatarUrl);
  selectedFile = signal<File | null>(null);

  editForm = this.fb.group({
    username: [
      this.data.username,
      [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9_]+$/),
      ],
    ],
    firstName: [
      this.data.firstName,
      [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)],
    ],
    lastName: [this.data.lastName, [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)]],
    email: [
      this.data.email,
      [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ],
    ],
    phone: [
      this.data.phone?.includes('X') ? '' : this.data.phone,
      [Validators.required, Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)],
    ],
  });

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        console.error('Invalid file type');
        return;
      }

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
    if (this.editForm.valid) {
      const file = this.selectedFile();
      if (file) {
        this.profileService.uploadProfilePicture(file).subscribe({
          next: (response) => {
            this.dialogRef.close({
              ...this.editForm.getRawValue(),
              avatarUrl: response.profilePictureUrl,
            });
          },
          error: (err: unknown) => {
            console.error('Failed to upload image:', err);
            this.dialogRef.close({
              ...this.editForm.getRawValue(),
              avatarUrl: this.tempAvatarUrl() || '',
            });
          },
        });
      } else {
        this.dialogRef.close({
          ...this.editForm.getRawValue(),
          avatarUrl: this.tempAvatarUrl() || '',
        });
      }
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
    const currentValue = control?.value?.toString().trim();

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
