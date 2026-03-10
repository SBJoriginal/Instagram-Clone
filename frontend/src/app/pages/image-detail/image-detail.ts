import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageUploadService, ImageResponse } from '../../services/image-upload.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { MentionPipe } from '../../pipes/mention.pipe';

@Component({
  selector: 'app-image-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, MatIconModule, MentionPipe],
  templateUrl: './image-detail.html',
  styleUrl: './image-detail.css',
})
export class ImageDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly imageService = inject(ImageUploadService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly location = inject(Location);

  image: ImageResponse | null = null;
  loading = true;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!id) {
      this.loading = false;
      return;
    }

    this.imageService.getImageById(id).subscribe({
      next: (data) => {
        this.image = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load image details:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  navigateToProfile(username: string | undefined | null): void {
    if (username) {
      // Clean @ if present
      const cleanName = username.startsWith('@') ? username.substring(1) : username;
      if (cleanName) {
        this.router.navigate(['/explore/profile', cleanName.trim()]);
      }
    }
  }
}
