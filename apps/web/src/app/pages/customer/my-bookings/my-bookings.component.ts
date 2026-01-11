import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RatingService } from '../../../core/services/rating.service';
import { BookingService } from '../../../core/services/booking.service';
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
  private readonly bookingService = inject(BookingService);
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

  // Status filter
  filterStatus = signal<string>('Confirmed');

  // Filtered bookings computed
  filteredBookings = computed(() => {
    const status = this.filterStatus();
    const list = this.bookings();
    if (status === 'All') return list;

    if (status === 'Pending') {
      // Pending bao gồm cả Pending Approval (Chờ duyệt) và Pending (đã duyệt chờ nhận)
      return list.filter(b => b.status === 'Pending');
    }
    
    return list.filter(b => b.status === status);
  });

  setFilter(status: string): void {
    this.filterStatus.set(status);
  }

  loadBookings(): void {
    this.isLoading.set(true);
    this.http.get<BookingResponseDTO[]>(`${environment.apiUrl}/bookings/my`).subscribe({
      next: (data) => {
        // Filter out job posts from this general list
        const confirmedOnly = data.filter(b => !b.isJobPost);
        this.bookings.set(confirmedOnly);
        
        this.totalBookings.set(confirmedOnly.length);
        this.pendingBookings.set(confirmedOnly.filter(b => b.status === 'Pending').length);
        this.confirmedBookings.set(confirmedOnly.filter(b => b.status === 'Confirmed').length);
        this.completedBookings.set(confirmedOnly.filter(b => b.status === 'Completed').length);
        this.cancelledBookings.set(confirmedOnly.filter(b => b.status === 'Cancelled' || b.status === 'Rejected').length);
        
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

  getStatusLabel(booking: BookingResponseDTO): string {
    if (booking.status === 'Pending') {
      if (booking.approvalStatus === 'Pending') return 'Chờ duyệt';
      if (booking.approvalStatus === 'Approved') return 'Đang tìm người';
      if (booking.approvalStatus === 'Rejected') return 'Bị từ chối';
    }
    
    // Status chính
    const labels: Record<string, string> = {
      'Confirmed': 'Đã có người nhận',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy',
      'Rejected': 'Bị từ chối'
    };
    return labels[booking.status] || booking.status;
  }

  getStatusClass(booking: BookingResponseDTO): string {
    if (booking.status === 'Pending') {
      if (booking.approvalStatus === 'Pending') return 'status-pending-approval';
      if (booking.approvalStatus === 'Approved') return 'status-seeking';
      if (booking.approvalStatus === 'Rejected') return 'status-rejected';
    }
    return booking.status.toLowerCase();
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
      error: (err: any) => {
        this.notification.error(err.error?.message || 'Lỗi khi xác nhận');
        this.isConfirming.set(false);
      }
    });
  }

  cancelBooking(booking: BookingResponseDTO): void {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    this.bookingService.cancelByCustomer(booking.id).subscribe({
      next: () => {
        this.notification.success('Đã hủy đơn hàng thành công.');
        this.loadBookings();
      },
      error: (err: any) => {
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
