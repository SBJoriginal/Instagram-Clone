import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { Notification } from '../models/notification.model';
import { TokenService } from './token.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  private readonly apiUrl = `${environment.apiUrl}/notification`;
  private hubConnection?: signalR.HubConnection;

  private readonly _notifications = signal<Notification[]>([]);

  readonly notifications = this._notifications.asReadonly();

  readonly unreadCount = computed(() => this._notifications().filter((n) => !n.isRead).length);

  loadNotifications(): void {
    this.http.get<Notification[]>(this.apiUrl).subscribe({
      next: (notifications) => this._notifications.set(notifications),
    });
  }

  markAsRead(id: number): void {
    this.http.patch(`${this.apiUrl}/${id}/read`, {}).subscribe({
      next: () => {
        this._notifications.update((notifications) =>
          notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      },
    });
  }

  startConnection(): void {
    const token = this.tokenService.getAccessToken();
    if (!token) return;

    if (
      this.hubConnection?.state === signalR.HubConnectionState.Connected ||
      this.hubConnection?.state === signalR.HubConnectionState.Connecting
    ) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl.replace('/api', '')}/hubs/notifications?access_token=${token}`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveNotification', (notification: Notification) => {
      this._notifications.update((current) => [notification, ...current]);
    });

    this.hubConnection
      .start()
      .then(() => this.loadNotifications())
      .catch((err) => console.error('SignalR error:', err));
  }

  stopConnection(): void {
    this.hubConnection?.stop();
  }
}
