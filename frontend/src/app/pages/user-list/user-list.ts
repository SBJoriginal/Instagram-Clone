import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MOCK_USERS } from '../../mocks/mock-data';

@Component({
  selector: 'app-user-list',
  imports: [RouterLink],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserListComponent {
  users = MOCK_USERS;
}
