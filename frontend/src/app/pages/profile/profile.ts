import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ProfileHeader } from './profile_header.component/profile_header.component';
import { AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ImageResponse, ImageUploadService, ImageUpdateData } from '../../services/image-upload.service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { ImageEditDialog } from '../../image-edit-dialog/image-edit-dialog';

@Component({
  selector: 'app-profile',
  imports: [ProfileHeader, AsyncPipe, MatCardModule, MatMenuModule, MatButtonModule, MatIconModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block; width: 100%; align-self: flex-start;',
  },
})
export class Profile {
  private readonly imageService = inject(ImageUploadService);
  private readonly dialog = inject(MatDialog);
  private readonly refresh$ = new BehaviorSubject<void>(void 0);

  readonly images = this.refresh$.pipe(switchMap(() => this.imageService.getImages()));

  openEditDialog(image: ImageResponse): void {
    const dialogRef = this.dialog.open(ImageEditDialog, {
      width: '450px',
      data: image,
    });

    dialogRef.afterClosed().subscribe((result: ImageUpdateData) => {
      if (result) {
        this.imageService.updateImage(image.id, result).subscribe(() => {
          this.refresh$.next();
        });
      }
    });
  }

  deleteImage(image: ImageResponse): void {
    if (confirm('Are you sure you want to delete this image?')) {
      this.imageService.deleteImage(image.id).subscribe(() => {
        this.refresh$.next();
      });
    }
  }
}
