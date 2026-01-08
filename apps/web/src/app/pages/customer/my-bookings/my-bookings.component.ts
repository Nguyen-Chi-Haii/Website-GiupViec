import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RatingService } from '../../../core/services/rating.service';
import { BookingResponseDTO, RatingCreateDTO } from '@giupviec/shared';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.css'
})
export class CustomerMyBookingsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly bookingState = inject(BookingStateService);
  private readonly notification = inject(NotificationService);
  private readonly ratingService = inject(RatingService);

  isLoading = signal(true);
  payingBookingId = signal<number | null>(null);
  bookings = signal<BookingResponseDTO[]>([]);
  selectedBooking = signal<BookingResponseDTO | null>(null);
  
  // Rating states
  ratingBooking = signal<BookingResponseDTO | null>(null);
  currentScore = signal(0);
  ratingComment = '';
  isSubmittingRating = signal(false);

  totalBookings = signal(0);
  pendingBookings = signal(0);
  confirmedBookings = signal(0);
  completedBookings = signal(0);
  cancelledBookings = signal(0);

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading.set(true);
    this.http.get<BookingResponseDTO[]>(`${environment.apiUrl}/bookings/my`).subscribe({
      next: (data) => {
        this.bookings.set(data);
        
        this.totalBookings.set(data.length);
        this.pendingBookings.set(data.filter(b => b.status === 'Pending').length);
        this.confirmedBookings.set(data.filter(b => b.status === 'Confirmed').length);
        this.completedBookings.set(data.filter(b => b.status === 'Completed').length);
        this.cancelledBookings.set(data.filter(b => b.status === 'Cancelled' || b.status === 'Rejected').length);
        
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Không thể tải danh sách đơn hàng');
      }
    });
  }

  viewBooking(booking: BookingResponseDTO): void {
    this.selectedBooking.set(booking);
  }

  closeModal(): void {
    this.selectedBooking.set(null);
  }

  openRatingModal(booking: BookingResponseDTO): void {
    this.ratingBooking.set(booking);
    this.currentScore.set(5); // Default to 5 stars
    this.ratingComment = '';
    this.selectedBooking.set(null); // Close detail modal if open
  }

  closeRatingModal(): void {
    this.ratingBooking.set(null);
    this.currentScore.set(0);
    this.ratingComment = '';
  }

  getScoreLabel(score: number): string {
    const labels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'];
    return labels[score] || '';
  }

  submitRating(): void {
    const booking = this.ratingBooking();
    if (!booking) return;

    this.isSubmittingRating.set(true);
    const dto: RatingCreateDTO = {
      bookingId: booking.id,
      score: this.currentScore(),
      comment: this.ratingComment
    };

    this.ratingService.createRating(dto).subscribe({
      next: () => {
        this.isSubmittingRating.set(false);
        this.notification.success('Cảm ơn bạn đã đánh giá dịch vụ!');
        this.closeRatingModal();
        this.loadBookings(); // Reload to update IsRated status
      },
      error: (err) => {
        this.isSubmittingRating.set(false);
        this.notification.error(err.error?.message || 'Có lỗi khi gửi đánh giá');
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'Pending': 'Chờ xử lý',
      'Confirmed': 'Đã xác nhận',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy',
      'Rejected': 'Từ chối'
    };
    return labels[status] || status;
  }

  formatTime(time: string): string {
    if (!time) return '';
    return time.substring(0, 5);
  }

  // --- CONFIRMATION ---
  
  canConfirmCompletion(booking: BookingResponseDTO): boolean {
    if (booking.status !== 'Confirmed') return false; 
    if (booking.customerConfirmed) return false;

    // Time Check
    // booking.endDate is Date object or string? From API it's string.
    // booking.endTime is "HH:mm" string.
    const endDateTime = new Date(booking.endDate);
    const [hours, minutes] = booking.endTime.split(':').map(Number);
    endDateTime.setHours(hours, minutes, 0, 0);

    return new Date() >= endDateTime;
  }

  isConfirming = signal(false);

  confirmCompletion(booking: BookingResponseDTO): void {
    if (!confirm('Xác nhận công việc đã hoàn thành?')) return;

    this.isConfirming.set(true);
    this.http.post(`${environment.apiUrl}/bookings/${booking.id}/confirm-customer`, {}).subscribe({
      next: () => {
        this.notification.success('Đã xác nhận hoàn thành!');
        this.isConfirming.set(false);
        this.loadBookings();
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Lỗi khi xác nhận');
        this.isConfirming.set(false);
      }
    });
  }

  cancelBooking(booking: BookingResponseDTO): void {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    this.http.put(`${environment.apiUrl}/bookings/${booking.id}/status`, { status: 5 }).subscribe({
      next: () => {
        this.notification.success('Đã hủy đơn hàng thành công.');
        this.loadBookings();
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Có lỗi khi hủy đơn');
      }
    });
  }

  payBooking(bookingId: number): void {
    const confirmed = confirm(`Xác nhận thanh toán cho đơn hàng #${bookingId}?`);
    if (!confirmed) return;

    this.payingBookingId.set(bookingId);
    
    setTimeout(() => {
      this.http.put(`${environment.apiUrl}/bookings/${bookingId}/payment-confirm`, {}).subscribe({
        next: () => {
          this.payingBookingId.set(null);
          this.notification.success('Thanh toán thành công!');
          this.loadBookings();
        },
        error: (err) => {
          this.payingBookingId.set(null);
          this.notification.error('Thanh toán thất bại: ' + (err.error?.message || 'Lỗi hệ thống'));
        }
      });
    }, 1500);
  }

  reorderBooking(booking: BookingResponseDTO): void {
    this.bookingState.setReorderData({
      serviceId: booking.serviceId,
      serviceName: booking.serviceName,
      startDate: booking.startDate,
      endDate: booking.endDate,
      workShiftStart: booking.startTime,
      workShiftEnd: booking.endTime,
      address: booking.address,
      notes: booking.notes || undefined
    });
    
    this.router.navigate(['/booking/step1']);
  }
}
