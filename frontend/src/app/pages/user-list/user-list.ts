import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';

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
  users$: Observable<User[]> = this.userService.getUsers();
}
