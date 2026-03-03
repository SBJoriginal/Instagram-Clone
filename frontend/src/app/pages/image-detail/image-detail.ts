import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageUploadService, ImageResponse } from '../../services/image-upload.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { MentionPipe } from '../../pipes/mention.pipe';
import { CommentService } from '../../services/comment.service';
import { Comment } from '../../models/comment.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';

import { ReactionService } from '../../services/reaction.service';

@Component({
  selector: 'app-image-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MentionPipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './image-detail.html',
  styleUrl: './image-detail.css',
})
export class ImageDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly imageService = inject(ImageUploadService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly location = inject(Location);
  private readonly commentService = inject(CommentService);
  private readonly reactionService = inject(ReactionService);

  image: ImageResponse | null = null;
  loading = true;

  // Comment related signals and state
  comments = signal<Comment[]>([]);
  newCommentContent = signal('');
  commentPage = signal(1);
  hasMoreComments = signal(true);
  isAddingComment = signal(false);
  isLoadingComments = signal(false);
  readonly maxLength = 500;

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
        this.loadComments();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load image details:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadComments(): void {
    if (!this.image || !this.hasMoreComments() || this.isLoadingComments()) return;

    this.isLoadingComments.set(true);
    this.commentService.getComments(this.image.id, this.commentPage()).subscribe({
      next: (newComments) => {
        this.comments.update((current) => [...current, ...newComments]);
        this.hasMoreComments.set(newComments.length === 10);
        this.commentPage.update((p) => p + 1);
        this.isLoadingComments.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load comments:', err);
        this.isLoadingComments.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  addComment(): void {
    if (!this.image || !this.newCommentContent().trim() || this.isAddingComment()) return;

    this.isAddingComment.set(true);
    this.commentService
      .addComment({
        imageId: this.image.id,
        content: this.newCommentContent().trim(),
      })
      .subscribe({
        next: (comment) => {
          this.comments.update((current) => [comment, ...current]);
          this.newCommentContent.set('');
          if (this.image) {
            this.image = { ...this.image, commentCount: (this.image.commentCount || 0) + 1 };
          }
          this.isAddingComment.set(false);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to add comment:', err);
          this.isAddingComment.set(false);
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
      this.router.navigate(['/home/profile', cleanName.trim()]);
    }
  }

  toggleLike(): void {
    if (!this.image) return;

    this.reactionService.toggleReaction(this.image.id).subscribe({
      next: () => {
        if (this.image) {
          const wasLiked = this.image.hasReacted;
          this.image = {
            ...this.image,
            hasReacted: !wasLiked,
            reactionCount: wasLiked
              ? (this.image.reactionCount || 1) - 1
              : (this.image.reactionCount || 0) + 1,
          };
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to toggle reaction:', err);
      },
    });
  }

  formatImageUrl(path?: string | null): string {
    if (!path) return '/default-avatar.png';
    if (path === '/default-avatar.png') return path;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `http://localhost:8081/${cleanPath}`;
  }
}
