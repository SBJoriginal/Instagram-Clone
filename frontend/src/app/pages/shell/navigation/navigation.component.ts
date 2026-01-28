import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { LogoComponent } from '../../../shared/ui/logo/logo.component';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ImageUploadDialog } from '../../../image-upload-dialog/image-upload-dialog';
import { ImageUploadService, ImageResponse } from '../../../services/image-upload.service';
import { ImageUploadData } from '../../../image-upload/image-upload';

@Component({
  selector: 'app-navigation',
  imports: [MatIconModule, LogoComponent, MatButtonModule, RouterLink, MatListModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
})
export class NavigationComponent {
  private dialog = inject(MatDialog);
  private uploadService = inject(ImageUploadService);

  openCreateDialog() {
    const dialogRef = this.dialog.open(ImageUploadDialog);

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
