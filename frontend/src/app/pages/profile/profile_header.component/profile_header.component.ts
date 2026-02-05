import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
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
})
export class ProfileHeader implements OnInit {
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
    // Just call the API - the auth interceptor will add the token
    // and the backend will validate and extract the user information
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
        // Profile not completed yet or error occurred
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
}
