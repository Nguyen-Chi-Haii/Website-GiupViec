import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { BookingService, GuestBookingResponseDTO } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { BookingResponseDTO } from '@giupviec/shared';

@Component({
  selector: 'app-booking-step4',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step4-confirm.component.html',
  styleUrl: './step4-confirm.component.css'
})
export class BookingStep4Component implements OnInit {
  private readonly bookingState = inject(BookingStateService);
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  agreeTerms = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  
  // Guest booking result
  guestBookingResult = signal<GuestBookingResponseDTO | null>(null);

  ngOnInit(): void {
    this.bookingState.setCurrentStep(4);

    // Check prerequisites
    if (!this.bookingState.canProceedToStep4()) {
      this.router.navigate(['/booking/step3']);
      return;
    }
  }

  get isLoggedIn() {
    return this.authService.isAuthenticated();
  }

  get guestInfo() {
    return this.bookingState.guestInfo();
  }

  get selectedService() {
    return this.bookingState.selectedService();
  }

  get schedule() {
    return this.bookingState.schedule();
  }

  get address() {
    return this.bookingState.address();
  }

  get notes() {
    return this.bookingState.notes();
  }

  get selectedHelper() {
    return this.bookingState.selectedHelper();
  }

  get autoAssignHelper() {
    return this.bookingState.autoAssignHelper();
  }

  get totalHours() {
    return this.bookingState.totalHours();
  }

  get totalPrice() {
    return this.bookingState.totalPrice();
  }

  onBack(): void {
    this.router.navigate(['/booking/step3']);
  }

  onSubmit(): void {
    if (!this.agreeTerms()) {
      this.errorMessage.set('Vui lòng đồng ý với điều khoản sử dụng.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    console.log('[Booking Submit] isLoggedIn:', this.isLoggedIn);
    console.log('[Booking Submit] authService.isAuthenticated():', this.authService.isAuthenticated());
    console.log('[Booking Submit] currentUser:', this.authService.currentUser());

    if (this.isLoggedIn) {
      // Logged-in user booking
      console.log('[Booking Submit] Using AUTHENTICATED booking flow');
      this.submitAuthenticatedBooking();
    } else {
      // Guest booking
      console.log('[Booking Submit] Using GUEST booking flow');
      this.submitGuestBooking();
    }
  }

  private submitAuthenticatedBooking(): void {
    const bookingData = this.bookingState.getBookingData();

    this.bookingService.create(bookingData).subscribe({
      next: (response: BookingResponseDTO) => {
        this.successMessage.set('Đặt dịch vụ thành công! Mã đơn hàng: #' + response.id);
        this.isSubmitting.set(false);
        
        // Reset state after 3 seconds and redirect to dashboard
        setTimeout(() => {
          this.bookingState.reset();
          this.router.navigate(['/customer']);
        }, 3000);
      },
      error: (err: { error?: { message?: string } }) => {
        console.error('Booking error:', err);
        this.errorMessage.set(err.error?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        this.isSubmitting.set(false);
      }
    });
  }

  private submitGuestBooking(): void {
    // For guest booking, we use a placeholder captcha token (backend skips in dev mode)
    const guestBookingData = this.bookingState.getGuestBookingData('dev-captcha-token');

    this.bookingService.createGuestBooking(guestBookingData).subscribe({
      next: (response: GuestBookingResponseDTO) => {
        this.guestBookingResult.set(response);
        this.successMessage.set(response.message);
        this.isSubmitting.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        console.error('Guest booking error:', err);
        this.errorMessage.set(err.error?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        this.isSubmitting.set(false);
      }
    });
  }

  onCloseGuestResult(): void {
    this.bookingState.reset();
    this.router.navigate(['/login']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(timeStr: string): string {
    return timeStr.substring(0, 5);
  }
}
