import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { LogService } from '../services/log.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ImageUploadComponent, ImageUploadData } from '../image-upload/image-upload';
import { ImageUploadService } from '../services/image-upload.service';

@Component({
  selector: 'app-image-upload-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, ImageUploadComponent],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Upload Image</h2>
      <button mat-icon-button (click)="close()" aria-label="Close dialog">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content>
      <div class="instructions">
        <p class="instruction-text">
          <strong>Instructions: </strong> Select an image (JPG, PNG, GIF, or WebP, max 5MB), add a
          description, hashtags, and mentions, then click "Upload Image".
        </p>
      </div>
      <app-image-upload (uploadImage)="handleUpload($event)" />
    </mat-dialog-content>
  `,
  styles: `
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    mat-dialog-content {
      padding: 0;
      margin: 0;
      overflow: visible;
    }

    h2 {
      margin: 0;
      padding: 24px 24px 16px;
    }

    button {
      margin-top: 12px;
      margin-right: 12px;
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
  private readonly imageUploadService = inject(ImageUploadService);
  private readonly logger = inject(LogService);

  isUploading = false;

  close(): void {
    this.dialogRef.close();
  }

  protected handleUpload(data: ImageUploadData): void {
    this.logger.info('=== Image Upload Data ===');
    this.logger.info('File Name:', data.file.name);

    this.isUploading = true;
    this.imageUploadService.uploadImage(data).subscribe({
      next: (response) => {
        this.imageUploadService.notifyImageCreated();
        this.dialogRef.close(response);
      },
      error: (error) => {
        this.logger.error('Image upload failed:', error);
        this.isUploading = false;
      },
    });
  }
}
