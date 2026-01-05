import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, BookingResponse, UserResponse } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CreateBookingModalComponent } from './create-booking-modal.component';

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
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Quản Lý Đơn Hàng</h2>
        <div class="header-actions">
          <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="filter-select">
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Chờ xử lý</option>
            <option value="Confirmed">Đã xác nhận</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Cancelled">Đã hủy</option>
            <option value="Rejected">Từ chối</option>
          </select>
          <select [(ngModel)]="paymentFilter" (change)="applyFilters()" class="filter-select">
            <option value="">Tất cả thanh toán</option>
            <option value="Unpaid">Chưa thanh toán</option>
            <option value="Paid">Đã thanh toán</option>
          </select>
          <button class="btn-primary" (click)="openCreateModal()">
            <span class="material-symbols-outlined">add</span>
            Tạo đơn hàng
          </button>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          @if (isLoading()) {
            <div class="loading">Đang tải...</div>
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Dịch vụ</th>
                  <th>Người giúp việc</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                  <th>Tổng tiền</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                @for (booking of filteredBookings(); track booking.id) {
                  <tr>
                    <td class="font-medium">#{{ booking.id }}</td>
                    <td>{{ booking.customerName }}</td>
                    <td class="text-muted">{{ booking.serviceName }}</td>
                    <td>
                      @if (booking.helperName) {
                        {{ booking.helperName }}
                      } @else {
                        <span class="text-warning">Chưa gán</span>
                      }
                    </td>
                    <td class="text-muted">{{ booking.startDate | date:'dd/MM/yyyy' }}</td>
                    <td class="text-muted">{{ booking.endDate | date:'dd/MM/yyyy' }}</td>
                    <td>
                      <span class="status-badge" [class]="getStatusClass(booking.status)">
                        {{ getStatusLabel(booking.status) }}
                      </span>
                    </td>
                    <td>
                      <span class="payment-badge" [class]="getPaymentClass(booking.paymentStatus)">
                        {{ getPaymentLabel(booking.paymentStatus) }}
                      </span>
                    </td>
                    <td class="font-medium">{{ booking.totalPrice | number }}₫</td>
                    <td>
                      <div class="action-buttons">
                        <button class="icon-btn" title="Xem chi tiết" (click)="viewBooking(booking)">
                          <span class="material-symbols-outlined">visibility</span>
                        </button>
                        @if (isBookingPending(booking.status)) {
                          @if (!booking.helperId) {
                            <button class="icon-btn primary" title="Gán Helper" (click)="openAssignModal(booking)">
                              <span class="material-symbols-outlined">person_add</span>
                            </button>
                          }
                          <button class="icon-btn success" title="Xác nhận" (click)="confirmBooking(booking.id)">
                            <span class="material-symbols-outlined">check</span>
                          </button>
                          <button class="icon-btn danger" title="Từ chối" (click)="rejectBooking(booking.id)">
                            <span class="material-symbols-outlined">close</span>
                          </button>
                        }
                        @if (isPaymentUnpaid(booking.paymentStatus) && (isBookingConfirmed(booking.status) || isBookingCompleted(booking.status))) {
                          <button class="icon-btn success" title="Xác nhận thanh toán" (click)="confirmPayment(booking.id)">
                            <span class="material-symbols-outlined">payments</span>
                          </button>
                        }
                        @if (isBookingConfirmed(booking.status)) {
                          <button class="icon-btn success" title="Hoàn thành công việc" (click)="completeBooking(booking.id)">
                            <span class="material-symbols-outlined">done_all</span>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="10" class="empty-state">Không có đơn hàng nào</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>

      <!-- Detail Modal -->
      @if (selectedBooking()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Chi Tiết Đơn Hàng #{{ selectedBooking()!.id }}</h3>
              <button class="close-btn" (click)="closeModal()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Khách hàng</label>
                  <p>{{ selectedBooking()!.customerName }}</p>
                </div>
                <div class="detail-item">
                  <label>Dịch vụ</label>
                  <p>{{ selectedBooking()!.serviceName }}</p>
                </div>
                <div class="detail-item">
                  <label>Người giúp việc</label>
                  <p>{{ selectedBooking()!.helperName || 'Chưa gán' }}</p>
                </div>
                <div class="detail-item">
                  <label>Địa chỉ</label>
                  <p>{{ selectedBooking()!.address }}</p>
                </div>
                <div class="detail-item">
                  <label>Thời gian</label>
                  <p>{{ selectedBooking()!.startDate | date:'dd/MM/yyyy' }} - {{ selectedBooking()!.endDate | date:'dd/MM/yyyy' }}</p>
                </div>
                <div class="detail-item">
                  <label>Khung giờ</label>
                  <p>{{ selectedBooking()!.startTime }} - {{ selectedBooking()!.endTime }}</p>
                </div>
                <div class="detail-item">
                  <label>Trạng thái</label>
                  <p>
                    <span class="status-badge" [class]="getStatusClass(selectedBooking()!.status)">
                      {{ getStatusLabel(selectedBooking()!.status) }}
                    </span>
                  </p>
                </div>
                <div class="detail-item">
                  <label>Thanh toán</label>
                  <p>
                    <span class="payment-badge" [class]="getPaymentClass(selectedBooking()!.paymentStatus)">
                      {{ getPaymentLabel(selectedBooking()!.paymentStatus) }}
                    </span>
                  </p>
                </div>
                <div class="detail-item">
                  <label>Tổng tiền</label>
                  <p class="price">{{ selectedBooking()!.totalPrice | number }}₫</p>
                </div>
                <div class="detail-item">
                  <label>Ngày tạo</label>
                  <p>{{ selectedBooking()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
                @if (selectedBooking()!.notes) {
                  <div class="detail-item full-width">
                    <label>Ghi chú</label>
                    <p>{{ selectedBooking()!.notes }}</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Assign Helper Modal -->
      @if (showAssignModal()) {
        <div class="modal-overlay" (click)="closeAssignModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Gán Người Giúp Việc</h3>
              <button class="close-btn" (click)="closeAssignModal()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="modal-body">
              <p class="assign-info">Đơn hàng: <strong>#{{ assigningBooking()?.id }}</strong> - {{ assigningBooking()?.serviceName }}</p>
              <div class="form-group">
                <label>Chọn người giúp việc</label>
                <select [(ngModel)]="selectedHelperId" class="form-select">
                  <option [value]="0">-- Chọn --</option>
                  @for (helper of availableHelpers(); track helper.id) {
                    <option [value]="helper.id">{{ helper.fullName }} (⭐ {{ helper.ratingAverage | number:'1.1-1' }})</option>
                  }
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-outline" (click)="closeAssignModal()">Hủy</button>
              <button class="btn-primary" (click)="assignHelper()" [disabled]="!selectedHelperId">
                Gán người làm
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Create Booking Modal -->
      @if (showCreateModal()) {
        <app-create-booking-modal 
          (closed)="closeCreateModal()" 
          (created)="onBookingCreated()">
        </app-create-booking-modal>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #111817; }
    .header-actions { display: flex; gap: 0.75rem; }
    .filter-select { padding: 0.5rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; background: white; cursor: pointer; }
    .card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .data-table th { text-align: left; padding: 1rem 1rem; background: #f6f8f8; color: #638884; font-weight: 500; font-size: 0.75rem; text-transform: uppercase; white-space: nowrap; }
    .data-table td { padding: 1rem 1rem; border-top: 1px solid #e5e7eb; color: #111817; }
    .data-table tr:hover { background: #f9fafb; }
    .font-medium { font-weight: 500; }
    .text-muted { color: #638884; }
    .text-warning { color: #f59e0b; font-style: italic; }
    .status-badge, .payment-badge { display: inline-flex; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .status-badge.pending { background: #fef3c7; color: #b45309; }
    .status-badge.confirmed { background: #dbeafe; color: #1d4ed8; }
    .status-badge.completed { background: #dcfce7; color: #16a34a; }
    .status-badge.cancelled { background: #f3f4f6; color: #6b7280; }
    .status-badge.rejected { background: #fef2f2; color: #dc2626; }
    .payment-badge.unpaid { background: #fef2f2; color: #dc2626; }
    .payment-badge.paid { background: #dcfce7; color: #16a34a; }
    .action-buttons { display: flex; gap: 0.5rem; }
    .icon-btn { width: 32px; height: 32px; border: none; background: #f6f8f8; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #638884; transition: all 0.2s; }
    .icon-btn:hover { background: #e5e7eb; color: #111817; }
    .icon-btn.success:hover { background: #dcfce7; color: #16a34a; }
    .icon-btn.danger:hover { background: #fef2f2; color: #dc2626; }
    .icon-btn.primary:hover { background: #dbeafe; color: #1d4ed8; }
    .icon-btn .material-symbols-outlined { font-size: 18px; }
    .loading, .empty-state { padding: 3rem; text-align: center; color: #638884; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 16px; width: 90%; max-width: 600px; max-height: 80vh; overflow: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; }
    .close-btn { background: none; border: none; cursor: pointer; color: #638884; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.5rem; border-top: 1px solid #e5e7eb; }
    .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .detail-item label { font-size: 0.8rem; color: #638884; text-transform: uppercase; margin-bottom: 0.25rem; display: block; }
    .detail-item p { margin: 0; font-size: 1rem; color: #111817; }
    .detail-item.full-width { grid-column: span 2; }
    .price { font-weight: 700; color: #13b9a5; font-size: 1.25rem !important; }
    .assign-info { margin-bottom: 1rem; color: #638884; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; color: #111817; }
    .form-select { width: 100%; padding: 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; }
    .btn-primary { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: #13b9a5; color: white; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { background: #0f9685; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-outline { padding: 0.75rem 1.25rem; background: transparent; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; }
  `]
})
export class AdminBookingsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly notification = inject(NotificationService);

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
        const helpers = users.filter(u => u.role === 'Helper');
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
