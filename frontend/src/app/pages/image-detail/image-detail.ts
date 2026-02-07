import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageUploadService, ImageResponse } from '../../services/image-upload.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './image-detail.html',
  styleUrl: './image-detail.css',
})
export class ImageDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly imageService = inject(ImageUploadService);
  private readonly cdr = inject(ChangeDetectorRef);

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
        console.error('API Error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
