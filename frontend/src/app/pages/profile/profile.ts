import { Component } from '@angular/core';
import { ProfileHeader } from './profile_header.component/profile_header.component';
import { AsyncPipe } from '@angular/common';
import { ImageUploadService } from '../../services/image-upload.service';
import { MatCardModule } from '@angular/material/card';
import { inject } from '@angular/core';

@Component({
  selector: 'app-profile',
  imports: [ProfileHeader, AsyncPipe, MatCardModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  host: {
    style: 'display: block; width: 100%; align-self: flex-start;',
  },
})
export class Profile {
  private readonly imageService = inject(ImageUploadService);
  readonly images = this.imageService.getImages();
}
