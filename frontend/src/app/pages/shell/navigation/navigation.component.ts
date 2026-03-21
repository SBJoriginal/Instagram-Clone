import { Component, inject, signal, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { LogoComponent } from '../../../shared/ui/logo/logo.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ImageUploadDialog } from '../../../image-upload-dialog/image-upload-dialog';
import { ImageUploadService } from '../../../services/image-upload.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { NotificationPanelComponent } from './notification-panel/notification-panel.component';

@Component({
  selector: 'app-navigation',
  imports: [
    MatIconModule,
    LogoComponent,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    NotificationPanelComponent,
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
})
export class NavigationComponent implements OnInit {
  private dialog = inject(MatDialog);
  private uploadService = inject(ImageUploadService);
  private authService = inject(AuthService); // Inject AuthService
  readonly notificationService = inject(NotificationService);

  isPanelOpen = signal(false);

  ngOnInit(): void {
    this.notificationService.startConnection();
    this.notificationService.loadNotifications();
  }

  togglePanel(): void {
    this.isPanelOpen.update((v) => !v);
  }

  logout() {
    this.authService.logout();
  }

  openCreateDialog() {
    this.dialog.open(ImageUploadDialog);
  }
}
