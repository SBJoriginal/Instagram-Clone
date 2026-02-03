import { Component, inject, ChangeDetectionStrategy, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

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
  public data = inject(MAT_DIALOG_DATA);
  public valueChange = output<Partial<ProfileEditData>>();
  public cancelEvent = output<void>();

  tempAvatarUrl = signal<string | null>(this.data.avatarUrl);

  editForm = this.fb.group({
    firstName: [this.data.firstName],
    lastName: [this.data.lastName],
    email: [this.data.email],
    phone: [this.data.phone],
  });

  constructor() {
    this.editForm.valueChanges.subscribe(() => {
      this.emitChanges();
    });
  }

  emitChanges() {
    this.valueChange.emit({
      ...this.editForm.getRawValue(),
      avatarUrl: this.tempAvatarUrl() || '',
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        this.tempAvatarUrl.set(url);
        this.emitChanges();
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
  }

  onCancel(): void {
    this.cancelEvent.emit();
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close();
  }
}
