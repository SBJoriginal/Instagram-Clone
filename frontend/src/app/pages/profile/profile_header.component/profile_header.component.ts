import { Component, inject, OnInit, signal, ChangeDetectionStrategy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProfileEditComponent } from '../profile_edit.component/profile_edit.component';
import { ProfileService } from '../../../services/profile.service';
import { TokenService } from '../../../services/token.service';
import { ProfileResponse } from '../../../models/auth.models';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
  ],
  templateUrl: './profile_header.component.html',
  styleUrls: ['./profile_header.component.css'],
  host: {
    style: 'display: block; width: 100%; align-self: flex-start;',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileHeader implements OnInit {
  @Input() username?: string | null;

  private readonly dialog = inject(MatDialog);
  private readonly profileService = inject(ProfileService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  protected readonly user = signal({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    memberSince: '',
    profilePictureUrl: '',
  });

  protected readonly profilePictureUrl = signal('');
  protected readonly isLoading = signal(true);
  protected readonly isOtherUserProfile = signal(false);
  protected readonly isDeletedAccount = signal(false);


  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    const currentUserProfile = this.profileService.getProfile();

    currentUserProfile.subscribe({
      next: (profile) => {
        const isOtherUser = !!this.username && this.username !== profile.userName;
        this.isOtherUserProfile.set(isOtherUser);

        const profileObservable = isOtherUser
          ? this.profileService.getUserProfileByUsername(this.username!)
          : this.profileService.getProfile();

        profileObservable.subscribe({
          next: (profile: ProfileResponse) => {
            this.user.set({
              username: profile.userName || '',
              firstName: profile.firstName || '',
              lastName: profile.lastName || '',
              email: profile.email,
              phone: profile.phoneNumber || '',
              memberSince: new Date(profile.signUpDate).toLocaleDateString(),
              profilePictureUrl: this.formatImageUrl(profile.profilePictureUrl || ''),
            });
            this.isLoading.set(false);
          },
          error: (error) => {
            if (error.status !== 404) {
              console.error('Failed to load profile:', error);
            }
            if (error.status === 404 && isOtherUser) {
              this.isDeletedAccount.set(true);
            }
            const email = !isOtherUser ? this.tokenService.getEmailFromToken() : '';
            this.user.set({
              username: '',
              firstName: '',
              lastName: '',
              email: email || '',
              phone: '',
              memberSince: '',
              profilePictureUrl: '',
            });
            this.profilePictureUrl.set('');
            this.isLoading.set(false);
          },
        });
      },
    });
  }

  private formatImageUrl(path: string): string {
    if (!path) return '/default-avatar.png';
    if (path === '/default-avatar.png') return path; // ← AJOUTEZ
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `http://localhost:8081/${cleanPath}`;
  }

  openSettings(): void {
    const editData = {
      username: this.user().username,
      firstName: this.user().firstName,
      lastName: this.user().lastName,
      email: this.user().email,
      phone: this.user().phone,
      avatarUrl: this.user().profilePictureUrl,
    };

    const dialogRef = this.dialog.open(ProfileEditComponent, {
      data: editData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.loadProfile();

        if (!this.isOtherUserProfile() && result.newUsername) {
          setTimeout(() => {
            this.router.navigate(['/home/profile', result.newUsername]);
          }, 100);
        }
      }
    });
  }
}
