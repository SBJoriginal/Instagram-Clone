import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ImageResponse, ImageUploadService } from '../../services/image-upload.service';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ImageEditDialog } from '../../image-edit-dialog/image-edit-dialog';
import { BehaviorSubject, switchMap } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AsyncPipe, MatCardModule, MatMenuModule, MatButtonModule, MatIconModule],
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
            <mat-card-actions align="end">
              <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Image options">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="openEditDialog(image)">
                  <mat-icon>edit</mat-icon>
                  <span>Edit</span>
                </button>
                <button mat-menu-item (click)="deleteImage(image)">
                  <mat-icon>delete</mat-icon>
                  <span>Delete</span>
                </button>
              </mat-menu>
            </mat-card-actions>
          </mat-card>
        } @empty {
          <p>No images uploaded yet.</p>
        }
      </div>
    </div>
  `,
  styles: `
    .profile-container {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 24px;
    }

    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .image-card {
      border-radius: 16px;
      overflow: hidden;
      border: none;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
    }

    .image-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    img[mat-card-image] {
      width: 100%;
      height: 300px;
      object-fit: cover;
      margin: 0; /* Override default mat-card image margin */
      display: block;
    }

    mat-card-content {
      padding: 16px;
      flex-grow: 1;
    }

    mat-card-content p {
      margin: 0;
      color: #374151;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    mat-card-actions {
      padding: 8px 16px 16px;
      margin: 0;
      display: flex;
      justify-content: flex-end;
      border-top: none;
    }

    button[mat-icon-button] {
      color: #6b7280;
      transition: color 0.2s;
    }

    button[mat-icon-button]:hover {
      color: #111827;
      background-color: #f3f4f6;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly imageService = inject(ImageUploadService);
  private readonly dialog = inject(MatDialog);
  private readonly refresh$ = new BehaviorSubject<void>(void 0);

  readonly images = this.refresh$.pipe(
    switchMap(() => this.imageService.getImages())
  );

  openEditDialog(image: ImageResponse): void {
    const dialogRef = this.dialog.open(ImageEditDialog, {
      data: image,
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
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
