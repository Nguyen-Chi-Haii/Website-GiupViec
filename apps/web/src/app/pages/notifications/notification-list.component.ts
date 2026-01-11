import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserNotificationService } from '../../core/services/user-notification.service';
import { NotificationResponseDTO } from '../../core/models/notification.interface';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.css'
})
export class NotificationListComponent implements OnInit {
  constructor(private notificationService: UserNotificationService) {}

  goBack() {
    window.history.back();
  }

  notifications = signal<NotificationResponseDTO[]>([]);
  isLoading = signal(false);
  hasMore = signal(true);
  pageSize = 20;

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications(loadMore = false) {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    const skip = loadMore ? this.notifications().length : 0;

    this.notificationService.getNotifications(skip, this.pageSize).subscribe({
      next: (newItems) => {
        if (loadMore) {
          this.notifications.update(current => [...current, ...newItems]);
        } else {
          this.notifications.set(newItems);
        }
        
        this.hasMore.set(newItems.length === this.pageSize);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load notifcations', err);
        this.isLoading.set(false);
      }
    });
  }

  loadMore() {
    this.loadNotifications(true);
  }

  onNotificationClick(notification: NotificationResponseDTO) {
    if (!notification.isRead) {
      this.notifications.update(list => 
        list.map(n => n.id === notification.id ? {...n, isRead: true} : n)
      );
      this.notificationService.markAsRead(notification.id).subscribe();
    }
    this.notificationService.navigateToNotification(notification);
  }

  markAsRead(notification: NotificationResponseDTO) {
    // Legacy method - keep for potential other uses but template uses onNotificationClick
    this.onNotificationClick(notification);
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.update(list => list.map(n => ({...n, isRead: true})));
    });
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'BookingCreated': 'add_circle',
      'BookingApproved': 'check_circle',
      'BookingRejected': 'cancel',
      'BookingAccepted': 'handshake', // Helper accepts
      'BookingConfirmed': 'event_available',
      'BookingCompleted': 'task_alt',
      'BookingCancelled': 'event_busy',
      'PaymentConfirmed': 'payments',
      'RatingReceived': 'star'
    };
    return icons[type] || 'notifications';
  }

  getIconColor(type: string): string {
    const colors: Record<string, string> = {
      'BookingCreated': '#3b82f6',
      'BookingApproved': '#10b981',
      'BookingRejected': '#ef4444',
      'BookingAccepted': '#6366f1',
      'BookingConfirmed': '#14b8a6',
      'BookingCompleted': '#059669',
      'BookingCancelled': '#6b7280',
      'PaymentConfirmed': '#eab308',
      'RatingReceived': '#f97316'
    };
    return colors[type] || '#9ca3af';
  }
}
