import { Component, Inject, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ImageResponse, ImageUpdateData } from '../services/image-upload.service';
import { HashtagPipe } from '../pipes/hashtag.pipe';
import { MentionPipe } from '../pipes/mention.pipe';

@Component({
  selector: 'app-image-edit-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Edit Image</h2>
    <mat-dialog-content>
      <form [formGroup]="editForm" class="edit-form">
        <mat-form-field appearance="fill">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Hashtags</mat-label>
          <input matInput formControlName="hashtags" (blur)="onHashtagsBlur()" placeholder="#nature #photo" />
          <mat-hint>Separate with spaces</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Mentions</mat-label>
          <input matInput formControlName="mentions" (blur)="onMentionsBlur()" placeholder="@user" />
          <mat-hint>Separate with spaces</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: `
    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }
    textarea {
      resize: vertical;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageEditDialog {
  private readonly dialogRef = inject(MatDialogRef<ImageEditDialog>);

  readonly editForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ImageResponse) {
    this.editForm = new FormGroup({
      description: new FormControl(data.description || '', { nonNullable: true }),
      hashtags: new FormControl(data.hashtags || '', { nonNullable: true }),
      mentions: new FormControl(data.mentions || '', { nonNullable: true }),
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    const formValue = this.editForm.getRawValue();
    const updateData: ImageUpdateData = {
      description: formValue.description,
      hashtags: formValue.hashtags,
      mentions: formValue.mentions,
    };
    this.dialogRef.close(updateData);
  }

  onHashtagsBlur(): void {
    const control = this.editForm.controls['hashtags'];
    const value = control.value;
    if (!value) return;

    const formatted = new HashtagPipe().transform(value).join(' ');
    if (formatted !== value) {
      control.setValue(formatted);
    }
  }

  onMentionsBlur(): void {
    const control = this.editForm.controls['mentions'];
    const value = control.value;
    if (!value) return;

    const formatted = new MentionPipe().transform(value).join(' ');
    if (formatted !== value) {
      control.setValue(formatted);
    }
  }
}
