import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ProfileHeader } from './profile_header.component/profile_header.component';
import { AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import {
  ImageResponse,
  ImageUploadService,
  ImageUpdateData,
} from '../../services/image-upload.service';
import { BehaviorSubject, switchMap, merge } from 'rxjs';
import { ImageEditDialog } from '../../image-edit-dialog/image-edit-dialog';
import { ImageDetail } from '../../image-detail/image-detail';

@Component({
  selector: 'app-profile',
  imports: [
    ProfileHeader,
    AsyncPipe,
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    ImageDetail,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block; width: 100%; align-self: flex-start;',
  },
})
export class Profile {
  readonly dialog = inject(MatDialog);
  readonly imageUploadService = inject(ImageUploadService);
  protected readonly baseUrl = environment.apiUrl.replace('/api', '');

  private readonly refresh$ = new BehaviorSubject<void>(void 0);
  protected readonly images = merge(this.refresh$, this.imageUploadService.imageCreated$).pipe(
    switchMap(() => this.imageUploadService.getMyImages()),
  );

  openImageDetail(image: ImageResponse): void {
    this.dialog.open(ImageDetail, {
      data: image,
      width: '90vw',
      maxWidth: '1000px',
      height: 'auto',
      panelClass: 'custom-modalbox',
      autoFocus: false,
    });
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
