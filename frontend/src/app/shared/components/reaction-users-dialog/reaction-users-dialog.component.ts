import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ReactionService } from '../../../services/reaction.service';
import { User } from '../../../models/user.model';

export interface ReactionUsersDialogData {
  imageId: number;
}

@Component({
  selector: 'app-reaction-users-dialog',
  templateUrl: './reaction-users-dialog.component.html',
  styleUrls: ['./reaction-users-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
  ],
})
export class ReactionUsersDialogComponent implements OnInit {
  users: User[] = [];
  loading = true;

  private readonly reactionService = inject(ReactionService);
  private readonly router = inject(Router);
  private readonly dialogRef = inject(MatDialogRef<ReactionUsersDialogComponent>);
  public data = inject<ReactionUsersDialogData>(MAT_DIALOG_DATA);

  ngOnInit(): void {
    this.reactionService.getUsersWhoReacted(this.data.imageId).subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching reaction users', error);
        this.loading = false;
      },
    });
  }

  formatImageUrl(path: string | undefined): string {
    if (!path) {
      return '';
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${environment.apiUrl.replace('/api', '')}/${cleanPath}`;
  }

  navigateToProfile(userName: string): void {
    this.dialogRef.close();
    this.router.navigate(['/profile', userName]);
  }
}
