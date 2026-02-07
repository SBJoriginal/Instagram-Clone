import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ProfileHeader } from './profile_header.component/profile_header.component';
import { AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import {
  ImageResponse,
  ImageUploadService,
  ImageUpdateData,
} from '../../services/image-upload.service';
import { BehaviorSubject, switchMap, merge } from 'rxjs';
import { ImageEditDialog } from '../../image-edit-dialog/image-edit-dialog';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ProfileHeader, AsyncPipe, MatCardModule, MatMenuModule, MatButtonModule, MatIconModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block; width: 100%; align-self: flex-start;',
  },
})
export class Profile {
  private readonly router = inject(Router);
  readonly dialog = inject(MatDialog);
  readonly imageUploadService = inject(ImageUploadService);
  protected readonly baseUrl = environment.apiUrl.replace('/api', '');

  private readonly refresh$ = new BehaviorSubject<void>(void 0);
  protected readonly images = merge(this.refresh$, this.imageUploadService.imageCreated$).pipe(
    switchMap(() => this.imageUploadService.getMyImages()),
  );

  openImageDetail(image: ImageResponse): void {
    this.router.navigate(['/home/image', image.id]);
  }

  openEditDialog(image: ImageResponse): void {
    const dialogRef = this.dialog.open(ImageEditDialog, {
      width: '450px',
      data: image,
    });

    dialogRef.afterClosed().subscribe((result: ImageUpdateData) => {
      if (result) {
        this.imageUploadService.updateImage(image.id, result).subscribe(() => {
          this.refresh$.next();
        });
      }
    });
  }

  deleteImage(image: ImageResponse): void {
    if (confirm('Are you sure you want to delete this image?')) {
      this.imageUploadService.deleteImage(image.id).subscribe(() => {
        this.refresh$.next();
      });
    }
  }
}
