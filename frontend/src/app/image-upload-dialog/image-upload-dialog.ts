import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ImageUploadComponent, ImageUploadData } from '../image-upload/image-upload';

@Component({
  selector: 'app-image-upload-dialog',
  imports: [MatDialogModule, MatButtonModule, ImageUploadComponent],
  template: `
    <h2 mat-dialog-title>Upload Image</h2>
    <mat-dialog-content>
      <div class="instructions">
        <p class="instruction-text">
          <strong>Instructions:</strong> Select an image (JPG, PNG, GIF, or WebP, max 5MB), add a
          description, hashtags, and mentions, then click "Upload Image".
        </p>
      </div>
      <app-image-upload (uploadImage)="handleUpload($event)" />
    </mat-dialog-content>
  `,
  styles: `
    mat-dialog-content {
      padding: 0;
      margin: 0;
      overflow: visible;
    }

    h2 {
      margin: 0;
      padding: 24px 24px 16px;
    }

    .instructions {
      padding: 0 24px 16px;
      background-color: #eff6ff;
      border-bottom: 1px solid #dbeafe;
    }

    .instruction-text {
      margin: 0;
      padding: 12px;
      font-size: 0.875rem;
      color: #1e40af;
      line-height: 1.5;
      background-color: #dbeafe;
      border-radius: 0.5rem;
    }

    .instruction-text strong {
      color: #1e3a8a;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadDialog {
  private readonly dialogRef = inject(MatDialogRef<ImageUploadDialog>);

  protected handleUpload(data: ImageUploadData): void {
    console.log('=== Image Upload Data ===');
    console.log('File:', data.file);
    console.log('File Name:', data.file.name);
    console.log('File Size:', data.file.size, 'bytes');
    console.log('File Type:', data.file.type);
    console.log('Description:', data.description);
    console.log('Hashtags:', data.hashtags);
    console.log('Mentions:', data.mentions);
    console.log('========================');

    // Close dialog and return the data
    this.dialogRef.close(data);
  }
}
