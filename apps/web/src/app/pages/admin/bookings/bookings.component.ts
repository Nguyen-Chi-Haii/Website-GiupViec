import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, BookingResponse, UserResponse } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CreateBookingModalComponent } from './create-booking-modal.component';
import { HelperService } from '../../../core/services/helper.service';

interface AvailableHelper {
  id: number;
  fullName: string;
  email: string;
  ratingAverage: number;
}

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateBookingModalComponent],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class AdminBookingsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly notification = inject(NotificationService);
  private readonly helperService = inject(HelperService);

  bookings = signal<BookingResponse[]>([]);
  filteredBookings = signal<BookingResponse[]>([]);
  selectedBooking = signal<BookingResponse | null>(null);
  availableHelpers = signal<AvailableHelper[]>([]);
  isLoading = signal(true);
  
  statusFilter = '';
  paymentFilter = '';
  
  showAssignModal = signal(false);
  assigningBooking = signal<BookingResponse | null>(null);
  selectedHelperId = 0;

  // Create booking modal
  showCreateModal = signal(false);

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  onBookingCreated(): void {
    this.loadBookings();
  }

  ngOnInit(): void {
    this.loadBookings();
    this.loadHelpers();
  }

  loadBookings(): void {
    this.adminService.getAllBookings().subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.filteredBookings.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadHelpers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users: UserResponse[]) => {
        // Support both integer and string roles
        const helpers = users.filter(u => String(u.role) === '3' || String(u.role) === 'Helper');
        this.availableHelpers.set(helpers.map(h => ({ id: h.id, fullName: h.fullName, email: h.email, ratingAverage: 0 })));
      },
      error: (err: Error) => console.error('Error loading helpers:', err)
    });
  }

  applyFilters(): void {
    let result = this.bookings();
    if (this.statusFilter) {
      result = result.filter(b => this.normalizeStatus(b.status) === this.statusFilter.toLowerCase());
    }
    if (this.paymentFilter) {
      result = result.filter(b => this.normalizePayment(b.paymentStatus) === this.paymentFilter.toLowerCase());
    }
    this.filteredBookings.set(result);
  }

  viewBooking(booking: BookingResponse): void {
    this.selectedBooking.set(booking);
  }

  closeModal(): void {
    this.selectedBooking.set(null);
  }

  openAssignModal(booking: BookingResponse): void {
    this.assigningBooking.set(booking);
    this.selectedHelperId = 0;
    this.showAssignModal.set(true);
    
    // Dynamically fetch helpers available for this booking's time slot
    this.helperService.getAvailableHelpers({
      serviceId: booking.serviceId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      workShiftStart: booking.startTime.includes(':') && booking.startTime.split(':').length === 2 ? `${booking.startTime}:00` : booking.startTime,
      workShiftEnd: booking.endTime.includes(':') && booking.endTime.split(':').length === 2 ? `${booking.endTime}:00` : booking.endTime
    }).subscribe({
      next: (helpers) => {
        this.availableHelpers.set(helpers.map(h => ({
          id: h.userId, // Available API returns userId as id
          fullName: h.fullName,
          email: '', // Not provided by availability API
          ratingAverage: h.ratingAverage
        })));
      },
      error: (err) => {
        console.error('Error fetching available helpers:', err);
        // Fallback to all helpers if availability check fails
        this.loadHelpers();
      }
    });
  }

  closeAssignModal(): void {
    this.showAssignModal.set(false);
    this.assigningBooking.set(null);
  }

  assignHelper(): void {
    const booking = this.assigningBooking();
    if (!booking || !this.selectedHelperId) return;

    this.adminService.assignHelper({
      bookingId: booking.id,
      helperId: this.selectedHelperId
    }).subscribe({
      next: () => {
        this.notification.success('Gán người giúp việc thành công!');
        this.closeAssignModal();
        this.loadBookings();
      },
      error: (err) => this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể gán'))
    });
  }

  confirmBooking(id: number): void {
    this.adminService.updateBookingStatus(id, { status: 2 }).subscribe({ // 2 = Confirmed
      next: () => {
        this.notification.success('Đã xác nhận đơn hàng!');
        this.loadBookings();
      },
      error: (err) => this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể xác nhận'))
    });
  }

  async rejectBooking(id: number): Promise<void> {
    const confirmed = await this.notification.confirm('Bạn có chắc muốn từ chối đơn này?');
    if (confirmed) {
      this.adminService.updateBookingStatus(id, { status: 3 }).subscribe({ // 3 = Rejected
        next: () => {
          this.notification.success('Đã từ chối đơn hàng!');
          this.loadBookings();
        },
        error: (err) => this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể từ chối'))
      });
    }
  }

  async confirmPayment(id: number): Promise<void> {
    const confirmed = await this.notification.confirm('Xác nhận đơn này đã được thanh toán?');
    if (confirmed) {
      this.adminService.confirmPayment(id).subscribe({
        next: () => {
          this.notification.success('Đã xác nhận thanh toán!');
          this.loadBookings();
        },
        error: (err) => this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể xác nhận'))
      });
    }
  }

  async completeBooking(id: number): Promise<void> {
    const confirmed = await this.notification.confirm('Xác nhận công việc đã hoàn thành?');
    if (confirmed) {
      this.adminService.updateBookingStatus(id, { status: 4 }).subscribe({ // 4 = Completed
        next: () => {
          this.notification.success('Đã hoàn thành đơn hàng!');
          this.loadBookings();
        },
        error: (err) => this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể cập nhật'))
      });
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
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

  getPaymentClass(status: string): string {
    return status?.toLowerCase() || 'unpaid';
  }

  getPaymentLabel(status: string | number | null | undefined): string {
    const labels: Record<string, string> = {
      'Unpaid': 'Chưa TT',
      'Paid': 'Đã TT',
      'unpaid': 'Chưa TT',
      'paid': 'Đã TT',
      '0': 'Chưa TT',
      '1': 'Đã TT'
    };
    return labels[String(status || '')] || 'Chưa TT';
  }

  // Helper functions for status checking
  normalizeStatus(status: string | number | null | undefined): string {
    const statusStr = String(status || '').toLowerCase();
    const statusMap: Record<string, string> = {
      'pending': 'pending', '1': 'pending',
      'confirmed': 'confirmed', '2': 'confirmed',
      'rejected': 'rejected', '3': 'rejected',
      'completed': 'completed', '4': 'completed',
      'cancelled': 'cancelled', '5': 'cancelled'
    };
    return statusMap[statusStr] || statusStr;
  }

  normalizePayment(status: string | number | null | undefined): string {
    const statusStr = String(status || '').toLowerCase();
    if (statusStr === 'paid' || statusStr === '1' || statusStr === 'true') return 'paid';
    return 'unpaid';
  }

  isBookingPending(status: string | number | null | undefined): boolean {
    return this.normalizeStatus(status) === 'pending';
  }

  isBookingConfirmed(status: string | number | null | undefined): boolean {
    return this.normalizeStatus(status) === 'confirmed';
  }

  isBookingCompleted(status: string | number | null | undefined): boolean {
    return this.normalizeStatus(status) === 'completed';
  }

  isPaymentUnpaid(status: string | number | null | undefined): boolean {
    return this.normalizePayment(status) === 'unpaid';
  }
}
