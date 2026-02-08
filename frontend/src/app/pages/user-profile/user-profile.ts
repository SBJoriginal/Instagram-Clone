import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { ImagePost } from '../../models/image.model';
import { ImageGalleryComponent } from '../image-gallery/image-gallery';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  imports: [ImageGalleryComponent, AsyncPipe, MatCardModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
  host: {
    style: 'display: block; width: 100%; align-self: flex-start;',
  },
})
export class UserProfileComponent {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  user$: Observable<User>;
  userImages$: Observable<ImagePost[]>;

  constructor() {
    const id = this.route.snapshot.params['id'];
    this.user$ = this.userService.getUserById(id);
    this.userImages$ = this.userService.getUserImages(id);
  }
}
