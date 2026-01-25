import { Component } from '@angular/core';
import { ProfileHeader } from './profile-header/profile-header';

@Component({
  selector: 'app-profile',
  imports: [ProfileHeader],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile { }
