import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MOCK_USERS, MOCK_IMAGES } from '../../mocks/mock-data';
import { User } from '../../models/user.model';
import { ImagePost } from '../../models/image.model';
import { ImageGalleryComponent } from '../image-gallery/image-gallery';

@Component({
  selector: 'app-user-profile',
  imports: [ImageGalleryComponent],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfileComponent {
  user: User | undefined;
  userImages: ImagePost[] = [];

  constructor(private route: ActivatedRoute) {
    const id = Number(this.route.snapshot.params['id']);
    this.user = MOCK_USERS.find((u) => u.id === id);
    this.userImages = MOCK_IMAGES.filter((img) => img.userId === id);
  }
}