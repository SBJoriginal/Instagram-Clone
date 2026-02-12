import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-list',
  imports: [RouterLink, AsyncPipe, MatListModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
  host: {
    style: 'display: block; width: 100%; align-self: flex-start;',
  },
})
export class UserListComponent {
  private userService = inject(UserService);
  private baseUrl = environment.apiUrl.replace('/api', '');

  users$: Observable<User[]> = this.userService.getUsers().pipe(
    map((users) =>
      users.map((user) => ({
        ...user,
        profilePictureUrl: user.profilePictureUrl ? this.baseUrl + user.profilePictureUrl : '',
      })),
    ),
  );
}
