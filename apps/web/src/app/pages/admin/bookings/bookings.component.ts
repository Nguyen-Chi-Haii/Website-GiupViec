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
  
  statusFilter = 'Pending'; // Mặc định: Chờ xử lý
  paymentFilter = '';

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
        // Filter out job posts (unassigned postings) from the general management list
        const bookingsOnly = data.filter(b => !b.isJobPost);
        this.bookings.set(bookingsOnly);
        this.filteredBookings.set(bookingsOnly);
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

  closeAssignModal(): void {
    // Deprecated: assignment moved to Job Management
  }

  assignHelper(): void {
    // Deprecated: assignment moved to Job Management
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
