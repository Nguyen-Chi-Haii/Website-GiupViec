import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { BookingService } from '../../../core/services/booking.service';
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
  private readonly router = inject(Router);

  agreeTerms = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.bookingState.setCurrentStep(4);

    // Check prerequisites
    if (!this.bookingState.canProceedToStep4()) {
      this.router.navigate(['/booking/step3']);
      return;
    }
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

    const bookingData = this.bookingState.getBookingData();

    this.bookingService.create(bookingData).subscribe({
      next: (response: BookingResponseDTO) => {
        this.successMessage.set('Đặt dịch vụ thành công! Mã đơn hàng: #' + response.id);
        this.isSubmitting.set(false);
        
        // Reset state after 2 seconds and redirect
        setTimeout(() => {
          this.bookingState.reset();
          this.router.navigate(['/']);
        }, 3000);
      },
      error: (err: { error?: { message?: string } }) => {
        console.error('Booking error:', err);
        this.errorMessage.set(err.error?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        this.isSubmitting.set(false);
      }
    });
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
