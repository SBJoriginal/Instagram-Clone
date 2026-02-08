import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProfileEditComponent } from '../profile_edit.component/profile_edit.component';
import { ProfileService } from '../../../services/profile.service';
import { TokenService } from '../../../services/token.service';
import { ProfileRequest, ProfileResponse } from '../../../models/auth.models';

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
  private readonly dialog = inject(MatDialog);
  private readonly profileService = inject(ProfileService);
  private readonly tokenService = inject(TokenService);

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

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (profile: ProfileResponse) => {
        this.user.set({
          username: profile.username || '',
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
        console.error('Failed to load profile:', error);
        const email = this.tokenService.getEmailFromToken();
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
  }

  private formatImageUrl(path: string): string {
    if (!path) return '/default-avatar.png';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    // Assuming backend is at localhost:8081
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
      if (result) {
        // Mise à jour optimiste de l'interface (immédiate)
        this.user.update((current) => ({
          ...current,
          username: result.username,
          firstName: result.firstName,
          lastName: result.lastName,
          phone: result.phone,
          profilePictureUrl: this.formatImageUrl(result.avatarUrl || current.profilePictureUrl),
        }));

        // Map the result from the edit dialog to the ProfileRequest format
        const profileUpdate: ProfileRequest = {
          username: result.username,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          phoneNumber: result.phone,
        };

        // Note: Cette route POST nécessite une reconstruction Docker du Backend pour fonctionner.
        this.profileService.updateProfile(profileUpdate).subscribe({
          next: () => {
            // Recharger le profil complet depuis le serveur pour confirmer les changements
            this.loadProfile();
          },
          error: (err) => {
            console.error('Failed to update profile info:', err);
          },
        });
      }
    });
  }
}
