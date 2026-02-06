import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ProfileEditComponent } from '../profile_edit.component/profile_edit.component';
import { ProfileService } from '../../../services/profile.service';
import { TokenService } from '../../../services/token.service';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatCardModule],
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
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    memberSince: '',
    profilePictureUrl: '',
  });

  protected readonly isLoading = signal(true);

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.user.set({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email,
          phone: profile.phoneNumber || '',
          memberSince: new Date(profile.signUpDate).toLocaleDateString(),
          profilePictureUrl: profile.profilePictureUrl || '',
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
        const email = this.tokenService.getEmailFromToken();
        this.user.set({
          firstName: '',
          lastName: '',
          email: email || '',
          phone: '',
          memberSince: '',
          profilePictureUrl: '',
        });
        this.isLoading.set(false);
      },
    });
  }

  openSettings(): void {
    const editData = {
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
        this.user.update((current) => ({
          ...current,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          phone: result.phone,
          profilePictureUrl: result.avatarUrl,
        }));
      }
    });
  }
}
