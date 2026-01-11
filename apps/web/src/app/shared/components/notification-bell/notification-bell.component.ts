import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserNotificationService } from '../../../core/services/user-notification.service';
import { NotificationResponseDTO } from '../../../core/models/notification.interface';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.css'
})
export class NotificationBellComponent implements OnInit {
  private notificationService = inject(UserNotificationService);

  unreadCount = this.notificationService.unreadCount;
  previewList = signal<NotificationResponseDTO[]>([]);
  isLoading = signal<boolean>(false);
  isLoaded = signal<boolean>(false);

  ngOnInit() {
    this.refreshCount();
    // Poll every minute (optional, basic real-time simulation)
    setInterval(() => this.refreshCount(), 60000);
  }

  refreshCount() {
    this.notificationService.getUnreadCount().subscribe();
  }

  loadPreview() {
    // Only load if not recently loaded to save calls on toggle? 
    // Actually dropdown click triggers this every time. 
    this.isLoading.set(true);
    this.notificationService.getNotifications(0, 5).subscribe({
      next: (res) => {
        this.previewList.set(res);
        this.isLoading.set(false);
        this.isLoaded.set(true);
      },
      error: () => this.isLoading.set(false)
    });
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.refreshCount();
      // Update local preview list state
      this.previewList.update(list => list.map(n => ({...n, isRead: true})));
    });
  }

  handleNotificationClick(noti: NotificationResponseDTO) {
    if (!noti.isRead) {
      this.notificationService.markAsRead(noti.id).subscribe(() => {
         this.previewList.update(list => list.map(n => n.id === noti.id ? {...n, isRead: true} : n));
      });
    }
    this.closeDropdown();
    this.notificationService.navigateToNotification(noti);
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'BookingCreated': 'add_circle',
      'BookingApproved': 'check_circle',
      'BookingRejected': 'cancel',
      'BookingAccepted': 'handshake',
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
  isOpen = signal(false);

  toggleDropdown() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.loadPreview();
    }
  }

  closeDropdown() {
    this.isOpen.set(false);
  }

  viewAll() {
    this.closeDropdown();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }
}
