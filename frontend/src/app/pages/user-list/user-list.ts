import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-list',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserListComponent {
  private userService = inject(UserService);
  users$: Observable<User[]> = this.userService.getUsers();
}
