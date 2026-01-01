import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationData } from '../../core/services/notification.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    @for (notification of notificationService.notifications(); track notification.id) {
      <div class="popup-overlay" (click)="onOverlayClick(notification, $event)">
        <div class="popup-container" [class]="notification.type" (click)="$event.stopPropagation()">
          <div class="popup-icon">
            @switch (notification.type) {
              @case ('success') { <span class="material-symbols-outlined">check_circle</span> }
              @case ('error') { <span class="material-symbols-outlined">error</span> }
              @case ('warning') { <span class="material-symbols-outlined">warning</span> }
              @case ('info') { <span class="material-symbols-outlined">info</span> }
              @case ('confirm') { <span class="material-symbols-outlined">help</span> }
            }
          </div>
          <div class="popup-content">
            <h3 class="popup-title">{{ notification.title }}</h3>
            <p class="popup-message">{{ notification.message }}</p>
          </div>
          <div class="popup-actions">
            @if (notification.showConfirmButtons) {
              <button class="btn btn-cancel" (click)="close(notification, false)">Hủy</button>
              <button class="btn btn-confirm" (click)="close(notification, true)">Xác nhận</button>
            } @else {
              <button class="btn btn-close" (click)="close(notification)">Đóng</button>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .popup-container {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s ease-out;
    }

    .popup-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    .popup-icon .material-symbols-outlined {
      font-size: 36px;
      color: white;
    }

    .success .popup-icon { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .error .popup-icon { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .warning .popup-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .info .popup-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .confirm .popup-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

    .popup-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
      color: #111827;
    }

    .popup-message {
      font-size: 0.95rem;
      color: #6b7280;
      margin: 0 0 1.5rem;
      line-height: 1.5;
    }

    .popup-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-close {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-close:hover {
      background: #e5e7eb;
    }

    .btn-cancel {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-cancel:hover {
      background: #e5e7eb;
    }

    .btn-confirm {
      background: linear-gradient(135deg, #13b9a5, #0f9685);
      color: white;
    }

    .btn-confirm:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(19, 185, 165, 0.4);
    }

    .success .btn-close { background: #22c55e; color: white; }
    .success .btn-close:hover { background: #16a34a; }
    
    .error .btn-close { background: #ef4444; color: white; }
    .error .btn-close:hover { background: #dc2626; }
  `]
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
