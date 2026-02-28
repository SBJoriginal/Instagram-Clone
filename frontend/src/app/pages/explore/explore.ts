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
import {
  ExploreHeaderComponent,
  SearchType,
  ImageFilter,
} from './explore-header.component/explore-header.component';
import { UserListComponent } from '../user-list/user-list';
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
    UserListComponent,
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

  readonly currentSearchType = signal<SearchType>('images');
  readonly currentImageFilter = signal<ImageFilter>('description');
  readonly currentUserSearchQuery = signal<string>('');
  readonly searchQuery = signal<string>('');

  readonly images = signal<ImageResponse[]>([]);
  readonly page = signal(1);
  readonly hasMore = signal(true);
  readonly isLoading = signal(false);

  @ViewChild('sentinel') sentinel!: ElementRef;

  ngOnInit(): void {
    this.loadMore();

    this.uploadSubscription = this.imageService.imageCreated$.subscribe(() => {
      this.refreshGrid();
    });
  }

  onSearchTypeChange(type: SearchType): void {
    this.currentSearchType.set(type);
    if (type === 'images' && this.images().length === 0) {
      this.refreshGrid();
    }
  }

  onImageFilterChange(data: { filter: ImageFilter; query: string }): void {
    this.currentImageFilter.set(data.filter);
    this.searchQuery.set(data.query);
    this.refreshGrid();
  }

  onUserSearchChange(query: string): void {
    this.currentUserSearchQuery.set(query);
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
        if (
          entries[0].isIntersecting &&
          this.hasMore() &&
          !this.isLoading() &&
          this.currentSearchType() === 'images'
        ) {
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
    if (!this.hasMore() || this.isLoading()) return;

    this.isLoading.set(true);

    const filter = this.currentImageFilter();
    const query = this.searchQuery();
    const observable = query
      ? this.imageService.searchImages(filter, query, this.page(), 15)
      : this.imageService.getImages(this.page(), 15);

    observable.subscribe({
      next: (newImages) => {
        this.images.update((current) => [...current, ...newImages]);
        this.hasMore.set(newImages.length === 15);
        this.page.update((p) => p + 1);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasMore.set(false);
        this.isLoading.set(false);
      },
    });
  }

  openImage(image: ImageResponse): void {
    this.router.navigate(['/home/image', image.id]);
  }
}
