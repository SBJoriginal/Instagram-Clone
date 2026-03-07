import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { ProfileHeader } from './profile_header.component/profile_header.component';
import { AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import {
  ImageResponse,
  ImageUploadService,
  ImageUpdateData,
} from '../../services/image-upload.service';
import { ProfileService } from '../../services/profile.service';
import { TokenService } from '../../services/token.service';
import { BehaviorSubject, switchMap, merge, of } from 'rxjs';
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
  private readonly route = inject(ActivatedRoute);
  private readonly tokenService = inject(TokenService);
  private readonly profileService = inject(ProfileService);
  readonly dialog = inject(MatDialog);
  readonly imageUploadService = inject(ImageUploadService);
  protected readonly baseUrl = environment.apiUrl.replace('/api', '');

  protected readonly username = signal<string | null>(null);
  protected readonly currentUsername = signal<string | null>(null);
  protected readonly isOwnProfile = computed(() => {
    const routeUsername = this.username();
    const currentUsername = this.currentUsername();
    return !routeUsername || routeUsername === currentUsername;
  });
  protected readonly isDeletedAccount = signal(false);

  private readonly refresh$ = new BehaviorSubject<void>(void 0);
  protected readonly images = merge(this.refresh$, this.imageUploadService.imageCreated$).pipe(
    switchMap(() => {
      if (this.isDeletedAccount()) {
        return of([]);
      }
      const username = this.username();
      if (username) {
        return this.imageUploadService.getImagesByUsername(username);
      }
      return this.imageUploadService.getMyImages();
    }),
  );

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const uname = params.get('username');
      this.username.set(uname);

      if (uname) {
        this.profileService.getUserProfileByUsername(uname).subscribe({
          next: (profile) => {
            this.isDeletedAccount.set(profile.isDeleted === true);
            this.refresh$.next();
          },
          error: () => {
            this.refresh$.next();
          },
        });
      } else {
        this.isDeletedAccount.set(false);
        this.refresh$.next();
      }
    });

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.currentUsername.set(profile.userName || null);
      },
      error: () => {
        this.currentUsername.set(null);
      },
    });
  }

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
