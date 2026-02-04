import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProfileEditData } from '../profile.model';

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

  tempAvatarUrl = signal<string | null>(this.data.avatarUrl);

  editForm = this.fb.group({
    firstName: [this.data.firstName],
    lastName: [this.data.lastName],
    email: [this.data.email, [Validators.email]],
    phone: [this.data.phone?.includes('X') ? '' : this.data.phone, [Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]],
  });

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
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
    if (value.length > 10) value = value.substring(0, 10);

    let formatted = '';
    if (value.length > 0) {
      formatted = value.substring(0, 3);
      if (value.length > 3) {
        formatted += '-' + value.substring(3, 6);
        if (value.length > 6) {
          formatted += '-' + value.substring(6, 10);
        }
      }
    }

    input.value = formatted;
    this.editForm.get('phone')?.setValue(formatted);

    this.editForm.get('phone')?.markAsTouched();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editForm.valid) {
      this.dialogRef.close({
        ...this.editForm.getRawValue(),
        avatarUrl: this.tempAvatarUrl() || '',
      });
    }
  }

  private originalValues = {
    firstName: this.data.firstName,
    lastName: this.data.lastName,
    email: this.data.email,
    phone: this.data.phone?.includes('X') ? '' : this.data.phone,
  };

  onFieldFocus(fieldName: string): void {
    const control = this.editForm.get(fieldName);
    const currentValue = control?.value;

    if (currentValue === this.originalValues[fieldName as keyof typeof this.originalValues]) {
      control?.setValue('');
    }
  }

  onFieldBlur(fieldName: string): void {
    const control = this.editForm.get(fieldName);
    const currentValue = control?.value;

    if (!currentValue || currentValue.trim() === '') {
      // Ne pas restaurer le téléphone, laisser vide
      if (fieldName === 'phone') {
        control?.setValue('');
      } else {
        control?.setValue(this.originalValues[fieldName as keyof typeof this.originalValues]);
      }
    }
  }

}