import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ImageUploadDialog } from '../../image-upload-dialog/image-upload-dialog';
import { ImageUploadData } from '../../image-upload/image-upload';
import { ImageUploadService, ImageResponse } from '../../services/image-upload.service';

@Component({
  selector: 'app-test-upload-page',
  imports: [MatButtonModule],
  template: `
    <div class="test-page">
      <div class="header">
        <h1>Image Upload Test</h1>
        <p class="subtitle">Click the button to upload an image</p>
      </div>

      <div class="button-container">
        <button
          mat-raised-button
          color="primary"
          (click)="openUploadDialog()"
          class="upload-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload Image
        </button>
      </div>
    </div>
  `,
  styles: `
    .test-page {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 3rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      font-size: 1.25rem;
      color: #6b7280;
      margin: 0;
    }

    .button-container {
      display: flex;
      justify-content: center;
    }

    .upload-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.125rem;
      padding: 16px 32px;
    }

    .upload-button svg {
      width: 24px;
      height: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestUploadPage {
  private readonly dialog = inject(MatDialog);
  private readonly uploadService = inject(ImageUploadService);

  protected openUploadDialog(): void {
    const dialogRef = this.dialog.open(ImageUploadDialog, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result: ImageUploadData | undefined) => {
      if (result) {
        this.uploadService.uploadImage(result).subscribe({
          next: (response: ImageResponse) => {
            alert(`Successfully uploaded!\nID: ${response.id}\nPath: ${response.filePath}`);
          },
          error: (err: unknown) => {
            console.error('Upload failed', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            alert('Upload failed: ' + errorMessage);
          },
        });
      }
    });
  }
}
