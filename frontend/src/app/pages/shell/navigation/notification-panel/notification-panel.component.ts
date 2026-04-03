import { Component, inject, output, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-notification-panel',
  imports: [DatePipe, MatIconModule, MatButtonModule],
  templateUrl: './notification-panel.component.html',
  styleUrl: './notification-panel.component.css',
})
export class NotificationPanelComponent implements OnInit {
  readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  panelClose = output<void>();

  ngOnInit(): void {
    this.notificationService.loadNotifications();
  }

  onNotificationClick(id: number, imageId: number): void {
    this.notificationService.markAsRead(id);
    this.router.navigate(['/image', imageId]);
    this.panelClose.emit();
  }
}
