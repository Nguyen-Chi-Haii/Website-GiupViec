import { Injectable, signal, computed } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface NotificationData {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  showConfirmButtons?: boolean;
  resolve?: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private counter = 0;
  
  // Signal để lưu danh sách notifications
  private _notifications = signal<NotificationData[]>([]);
  notifications = computed(() => this._notifications());

  private getTitle(type: NotificationType): string {
    const titles: Record<NotificationType, string> = {
      success: 'Thành công',
      error: 'Lỗi',
      warning: 'Cảnh báo',
      info: 'Thông tin',
      confirm: 'Xác nhận'
    };
    return titles[type];
  }

  private show(type: NotificationType, message: string, showConfirmButtons = false): NotificationData {
    const notification: NotificationData = {
      id: ++this.counter,
      type,
      title: this.getTitle(type),
      message,
      showConfirmButtons
    };
    
    this._notifications.update(list => [...list, notification]);
    
    // Tự động đóng sau 3 giây nếu không phải confirm
    if (!showConfirmButtons) {
      setTimeout(() => this.close(notification.id), 3000);
    }
    
    return notification;
  }

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  warning(message: string): void {
    this.show('warning', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const notification = this.show('confirm', message, true);
      notification.resolve = resolve;
    });
  }

  close(id: number, result?: boolean): void {
    const notification = this._notifications().find(n => n.id === id);
    if (notification?.resolve) {
      notification.resolve(result ?? false);
    }
    this._notifications.update(list => list.filter(n => n.id !== id));
  }
}
