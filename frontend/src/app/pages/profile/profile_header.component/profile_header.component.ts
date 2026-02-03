import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileEditComponent } from '../profile_edit.component/profile_edit.component';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ProfileEditData } from '../profile.model';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './profile_header.component.html',
  styleUrls: ['./profile_header.component.css'],
  host: {
    style: 'display: block; width: 100%; align-self: flex-start;',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileHeader {
  readonly dialog = inject(MatDialog);

  user = signal({
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'example@email.com',
    phone: 'XXX - XXX - XXXX',
    memberSince: 'On since',
    avatarUrl: 'default-avatar.png',
  });

  openSettings() {
    const originalUser = this.user(); // Snapshot

    const dialogRef = this.dialog.open(ProfileEditComponent, {
      data: this.user(),
    });

    // Real-time updates
    dialogRef.componentInstance.valueChange.subscribe((newValue: Partial<ProfileEditData>) => {
      this.user.update((current) => ({ ...current, ...newValue }));
    });



    // Revert on cancel
    dialogRef.componentInstance.cancelEvent.subscribe(() => {
      this.user.set(originalUser);
    });
  }
}
