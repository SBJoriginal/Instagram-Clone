import { Component, inject, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Observable, map, combineLatest } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterLink, AsyncPipe, CommonModule, MatListModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
  host: {
    style: 'display: block; width: 100%; align-self: flex-start;',
  },
})
export class UserListComponent {
  private readonly userService = inject(UserService);
  private baseUrl = environment.apiUrl.replace('/api', '');

  readonly searchQuery = input<string>('');

  protected users$: Observable<User[]> = combineLatest([
    this.userService.getUsers(),
    toObservable(this.searchQuery),
  ]).pipe(
    map(([users, query]) => {
      const lowerQuery = query.toLowerCase().trim();

      return users
        .filter(
          (user) =>
            !lowerQuery ||
            user.userName?.toLowerCase().includes(lowerQuery) ||
            user.firstName?.toLowerCase().includes(lowerQuery) ||
            user.lastName?.toLowerCase().includes(lowerQuery),
        )
        .map((user) => ({
          ...user,
          profilePictureUrl: user.profilePictureUrl
            ? user.profilePictureUrl.startsWith('http')
              ? user.profilePictureUrl
              : this.baseUrl + user.profilePictureUrl
            : '/default-avatar.png',
        }));
    }),
  );
}
