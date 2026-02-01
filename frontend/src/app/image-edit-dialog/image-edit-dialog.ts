import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ImageResponse, ImageUpdateData } from '../services/image-upload.service';
import { ImageUploadComponent, ImageUploadData } from '../image-upload/image-upload';

@Component({
  selector: 'app-image-edit-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    ImageUploadComponent
  ],
  template: `
    <app-image-upload 
      [editData]="data" 
      (uploadImage)="onSave($event)" 
      (cancel)="close()">
    </app-image-upload>
  `,
  styles: `
    :host {
      display: block;
      max-height: 90vh;
      overflow-y: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageEditDialog {
  private readonly dialogRef = inject(MatDialogRef<ImageEditDialog>);
  protected readonly data = inject<ImageResponse>(MAT_DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }

  onSave(formData: ImageUploadData): void {
    const updateData: ImageUpdateData = {
      description: formData.description,
      hashtags: formData.hashtags,
      mentions: formData.mentions,
    };
    this.dialogRef.close(updateData);
  }
}
