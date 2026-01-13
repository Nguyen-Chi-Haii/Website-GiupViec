import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationResponseDTO } from '../models/notification.interface';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ChatService } from './chat.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class UserNotificationService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  private chatService = inject(ChatService);
  private toastService = inject(NotificationService);
  
  private baseUrl = `${environment.apiUrl}/notifications`;

  // Signals for reactive UI
  unreadCount = signal<number>(0);

  constructor() {
    // Request permission for Web Notifications
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Listen to real-time notifications
    this.chatService.notification$.subscribe((noti: any) => {
      // 1. Update unread count
      this.unreadCount.update(c => c + 1);
      
      // 2. Show toast
      this.toastService.info(`🔔 ${noti.title}: ${noti.message}`);
      
      // 3. System Notification (Windows style)
      if (Notification.permission === 'granted') {
         const sysNoti = new Notification(noti.title, {
            body: noti.message,
            icon: 'assets/icons/icon-72x72.png', // Fallback or app icon
            // tag: noti.id.toString() 
         });
         
         sysNoti.onclick = () => {
            window.focus();
            this.navigateToNotification(noti);
            sysNoti.close();
         };
      }
      
      // 4. Play sound (optional)
      // const audio = new Audio('assets/notification.mp3');
      // audio.play().catch(() => {});
    });
  }
  
  getNotifications(skip = 0, take = 20): Observable<NotificationResponseDTO[]> {
    const params = new HttpParams().set('skip', skip).set('take', take);
    return this.http.get<NotificationResponseDTO[]>(this.baseUrl, { params });
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/unread-count`).pipe(
      tap(res => this.unreadCount.set(res.count))
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/read`, {}).pipe(
      tap(() => {
        // Optimistically update count
        if (this.unreadCount() > 0) {
          this.unreadCount.update(c => c - 1);
        }
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCount.set(0))
    );
  }

  navigateToNotification(noti: NotificationResponseDTO) {
    const role = this.authService.getUserRole();
    let target = '/';

    // Basic role-based routing
    if (noti.relatedEntityType === 'Booking') {
      if (role === 'Admin' || role === 'Employee') {
        if (noti.type === 'BookingCreated') {
          target = '/admin/approvals';
        } else {
          target = '/admin/bookings';
        }
      } else if (role === 'Helper') {
        if (noti.type === 'BookingApproved') { // Becomes available for all helpers
          target = '/helper/jobs';
        } else {
          target = '/helper/my-jobs';
        }
      } else if (role === 'Customer') {
        if (noti.type === 'BookingRejected') {
          target = '/customer/job-posts';
        } else {
          target = '/customer';
        }
      }
    } else if (noti.relatedEntityType === 'Rating') {
       if (role === 'Helper') {
         target = '/helper/profile'; // Or wherever ratings are shown
       }
    } else {
      // Fallback based on role if no specific entity
      target = this.authService.getRedirectPath();
    }

    this.router.navigateByUrl(target);
  }
}
