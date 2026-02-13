import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageUploadService, ImageResponse } from '../../services/image-upload.service';
import { ExploreHeaderComponent } from './explore-header.component/explore-header.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatIconModule,
    ExploreHeaderComponent,
  ],
  templateUrl: './explore.html',
  styleUrl: './explore.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block; width: 100%;',
  },
})
export class Explore implements OnInit, AfterViewInit, OnDestroy {
  private readonly imageService = inject(ImageUploadService);
  private readonly router = inject(Router);
  private uploadSubscription?: Subscription;

  readonly images = signal<ImageResponse[]>([]);
  readonly page = signal(1);
  readonly hasMore = signal(true);

  @ViewChild('sentinel') sentinel!: ElementRef;

  ngOnInit(): void {
    this.loadMore();

    this.uploadSubscription = this.imageService.imageCreated$.subscribe(() => {
      this.refreshGrid();
    });
  }

  private refreshGrid(): void {
    this.images.set([]);
    this.page.set(1);
    this.hasMore.set(true);
    this.loadMore();
  }

  ngOnDestroy(): void {
    this.uploadSubscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasMore()) {
          this.loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (this.sentinel) {
      observer.observe(this.sentinel.nativeElement);
    }
  }

  loadMore(): void {
    if (!this.hasMore()) return;

    this.imageService.getImages(this.page(), 15).subscribe({
      next: (newImages) => {
        this.images.update((current) => [...current, ...newImages]);
        this.hasMore.set(newImages.length === 15);
        this.page.update((p) => p + 1);
      },
      error: () => {
        this.hasMore.set(false);
      },
    });
  }

  openImage(image: ImageResponse): void {
    this.router.navigate(['/home/image', image.id]);
  }
}
