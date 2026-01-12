import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { BookingStateService } from '../../core/services/booking-state.service';
import { BookingResponseDTO } from '@giupviec/shared';
import { RejectedBookingModalComponent } from '../../shared/components/rejected-booking-modal/rejected-booking-modal.component';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RejectedBookingModalComponent, NotificationBellComponent],
  templateUrl: './customer-layout.component.html',
  styleUrl: './customer-layout.component.css'
})
export class CustomerLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly bookingState = inject(BookingStateService);
  public readonly chatService = inject(ChatService);

  sidebarCollapsed = signal(false);
  currentUser = this.authService.currentUser;
  
  // Notification logic
  showRejectedModal = signal(false);
  rejectedBookings = signal<BookingResponseDTO[]>([]);

  ngOnInit(): void {
    if (this.authService.getUserRole() !== 'Customer') {
      this.router.navigate(['/']);
      return;
    }
    this.checkNotifications();
  }

  private checkNotifications(): void {
    this.bookingService.getMyBookings(1, 50, 'All', false).subscribe({
      next: (result) => {
        const rejected = result.items.filter(b => b.status === 'Rejected');
        if (rejected.length === 0) return;

        // Check against localStorage
        const dismissedKey = `dismissed_rejections_${this.currentUser()?.nameid}`;
        const dismissedIds = JSON.parse(localStorage.getItem(dismissedKey) || '[]') as number[];
        
        const newRejections = rejected.filter(b => !dismissedIds.includes(b.id));

        if (newRejections.length > 0) {
          this.rejectedBookings.set(newRejections);
          this.showRejectedModal.set(true);
        }
      }
    });
  }

  onDismissRejection(): void {
    const dismissedKey = `dismissed_rejections_${this.currentUser()?.nameid}`;
    const dismissedIds = JSON.parse(localStorage.getItem(dismissedKey) || '[]') as number[];
    
    const currentIds = this.rejectedBookings().map(b => b.id);
    const updatedIds = [...new Set([...dismissedIds, ...currentIds])];
    
    localStorage.setItem(dismissedKey, JSON.stringify(updatedIds));
    this.showRejectedModal.set(false);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  openChat(): void {
    this.chatService.toggleChat(!this.chatService.isChatOpen());
  }

  getUserInitials(): string {
    const email = this.currentUser()?.email || '';
    return email.charAt(0).toUpperCase();
  }

  startJobPosting(): void {
    this.bookingState.reset();
    this.bookingState.setPostingMode(true);
    this.router.navigate(['/booking/step1']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
