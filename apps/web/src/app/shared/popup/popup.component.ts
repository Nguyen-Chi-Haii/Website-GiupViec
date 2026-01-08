import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationData } from '../../core/services/notification.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css'
})
export class PopupComponent {
  notificationService = inject(NotificationService);

  close(notification: NotificationData, result?: boolean): void {
    this.notificationService.close(notification.id, result);
  }

  onOverlayClick(notification: NotificationData, event: Event): void {
    if (!notification.showConfirmButtons) {
      this.close(notification);
    }
  }
}
