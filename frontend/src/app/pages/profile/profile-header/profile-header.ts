import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './profile-header.html',
  styleUrls: ['./profile-header.css'],
  host: {
    style: 'display: block; width: 100%; align-self: flex-start;',
  },
})
export class ProfileHeader {
  user = {
    name: 'Name',
    email: 'Person_Name@email.com',
    phone: 'XXX - XXX - XXXX',
    memberSince: 'On since',
  };

  openSettings() {
    console.log('Settings clicked');
  }
}
