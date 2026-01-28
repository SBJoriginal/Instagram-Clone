import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ImageUploadService } from '../../services/image-upload.service';

import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AsyncPipe, MatCardModule],
  template: `
    <div class="profile-container">
      <h2>My Profile</h2>
      <div class="image-grid">
        @for (image of images | async; track image.id) {
          <mat-card class="image-card">
            <img
              mat-card-image
              [src]="'http://localhost:5266' + image.filePath"
              [alt]="image.description"
              loading="lazy"
            />
            <mat-card-content>
              <p>{{ image.description }}</p>
            </mat-card-content>
          </mat-card>
        } @empty {
          <p>No images uploaded yet.</p>
        }
      </div>
    </div>
  `,
  styles: `
    .profile-container {
      padding: 20px;
    }

    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .image-card {
      /* MatCard handles basic styling */
    }

    img[mat-card-image] {
      object-fit: contain;
      height: 250px;
      background-color: #f3f4f6;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly imageService = inject(ImageUploadService);
  readonly images = this.imageService.getImages();
}
