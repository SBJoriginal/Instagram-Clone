import { Component } from '@angular/core';
import { ProfileHeader } from './profile-header/profile-header';

@Component({
  selector: 'app-profile',
  imports: [ProfileHeader],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  host: {
    style: 'display: block; width: 100%; align-self: flex-start;',
  },
})
export class Profile {}
