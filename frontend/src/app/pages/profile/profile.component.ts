import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ImageUploadService } from '../../services/image-upload.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="profile-container">
      <h2>My Profile</h2>
      <div class="image-grid">
        @for (image of images | async; track image.id) {
          <div class="image-card">
            <img
              [src]="'http://localhost:5266' + image.filePath"
              [alt]="image.description"
              loading="lazy"
            />
            <div class="image-info">
              <p>{{ image.description }}</p>
            </div>
          </div>
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
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .image-card img {
      width: 100%;
      height: 250px;
      object-fit: contain;
      background-color: #f3f4f6;
      display: block;
    }

    .image-info {
      padding: 12px;
    }

    .image-info p {
      margin: 0;
      color: #374151;
      font-size: 0.875rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly imageService = inject(ImageUploadService);
  readonly images = this.imageService.getImages();
}
