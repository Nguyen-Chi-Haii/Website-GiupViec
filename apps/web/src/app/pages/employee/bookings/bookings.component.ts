import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminService, BookingResponse, UserResponse } from '../../../core/services/admin.service';

interface AvailableHelper {
  id: number;
  fullName: string;
  email: string;
  ratingAverage: number;
}

@Component({
  selector: 'app-employee-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
          </select>
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
                  <th>Ngày làm</th>
                  <th>Trạng thái</th>
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
                    <td>{{ booking.helperName || '-' }}</td>
                    <td class="text-muted">{{ booking.startDate | date:'dd/MM/yyyy' }}</td>
                    <td>
                      <span class="status-badge" [class]="booking.status.toLowerCase()">
                        {{ getStatusLabel(booking.status) }}
                      </span>
                    </td>
                    <td class="font-medium">{{ booking.totalPrice | number }}₫</td>
                    <td>
                      <div class="action-buttons">
                        <button class="icon-btn" title="Xem chi tiết" (click)="viewBooking(booking)">
                          <span class="material-symbols-outlined">visibility</span>
                        </button>
                        @if (booking.status === 'Pending') {
                          <button class="icon-btn primary" title="Gán Helper" (click)="openAssignModal(booking)">
                            <span class="material-symbols-outlined">person_add</span>
                          </button>
                          <button class="icon-btn success" title="Xác nhận" (click)="confirmBooking(booking.id)">
                            <span class="material-symbols-outlined">check</span>
                          </button>
                          <button class="icon-btn danger" title="Từ chối" (click)="rejectBooking(booking.id)">
                            <span class="material-symbols-outlined">close</span>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="empty-state">Không có đơn hàng nào</td>
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
              <h3>Chi Tiết Đơn #{{ selectedBooking()!.id }}</h3>
              <button class="close-btn" (click)="closeModal()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="detail-grid">
                <div class="detail-item"><label>Khách hàng</label><p>{{ selectedBooking()!.customerName }}</p></div>
                <div class="detail-item"><label>Dịch vụ</label><p>{{ selectedBooking()!.serviceName }}</p></div>
                <div class="detail-item"><label>Người giúp việc</label><p>{{ selectedBooking()!.helperName || 'Chưa gán' }}</p></div>
                <div class="detail-item"><label>Địa chỉ</label><p>{{ selectedBooking()!.address }}</p></div>
                <div class="detail-item"><label>Ngày làm</label><p>{{ selectedBooking()!.startDate | date:'dd/MM/yyyy' }}</p></div>
                <div class="detail-item"><label>Tổng tiền</label><p class="price">{{ selectedBooking()!.totalPrice | number }}₫</p></div>
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
              <div class="form-group">
                <label>Chọn người giúp việc</label>
                <select [(ngModel)]="selectedHelperId" class="form-select">
                  <option [value]="0">-- Chọn --</option>
                  @for (helper of availableHelpers(); track helper.id) {
                    <option [value]="helper.id">{{ helper.fullName }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-outline" (click)="closeAssignModal()">Hủy</button>
              <button class="btn-primary" (click)="assignHelper()" [disabled]="!selectedHelperId">Gán</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
    .filter-select { padding: 0.5rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; background: white; }
    .card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .data-table th { text-align: left; padding: 1rem; background: #f6f8f8; color: #638884; font-weight: 500; font-size: 0.75rem; text-transform: uppercase; }
    .data-table td { padding: 1rem; border-top: 1px solid #e5e7eb; }
    .data-table tr:hover { background: #f9fafb; }
    .font-medium { font-weight: 500; }
    .text-muted { color: #638884; }
    .status-badge { display: inline-flex; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .status-badge.pending { background: #fef3c7; color: #b45309; }
    .status-badge.confirmed { background: #dbeafe; color: #1d4ed8; }
    .status-badge.completed { background: #dcfce7; color: #16a34a; }
    .status-badge.cancelled, .status-badge.rejected { background: #f3f4f6; color: #6b7280; }
    .action-buttons { display: flex; gap: 0.5rem; }
    .icon-btn { width: 32px; height: 32px; border: none; background: #f6f8f8; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #638884; }
    .icon-btn:hover { background: #e5e7eb; color: #111817; }
    .icon-btn.success:hover { background: #dcfce7; color: #16a34a; }
    .icon-btn.danger:hover { background: #fef2f2; color: #dc2626; }
    .icon-btn.primary:hover { background: #dbeafe; color: #1d4ed8; }
    .icon-btn .material-symbols-outlined { font-size: 18px; }
    .loading, .empty-state { padding: 3rem; text-align: center; color: #638884; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 16px; width: 90%; max-width: 500px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; }
    .close-btn { background: none; border: none; cursor: pointer; color: #638884; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.5rem; border-top: 1px solid #e5e7eb; }
    .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .detail-item label { font-size: 0.8rem; color: #638884; text-transform: uppercase; }
    .detail-item p { margin: 0.25rem 0 0; font-size: 1rem; }
    .price { font-weight: 700; color: #13b9a5; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
    .form-select { width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; }
    .btn-primary { padding: 0.75rem 1.25rem; background: #13b9a5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-outline { padding: 0.75rem 1.25rem; background: transparent; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; }
  `]
})
export class EmployeeBookingsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly route = inject(ActivatedRoute);

  bookings = signal<BookingResponse[]>([]);
  filteredBookings = signal<BookingResponse[]>([]);
  selectedBooking = signal<BookingResponse | null>(null);
  availableHelpers = signal<AvailableHelper[]>([]);
  isLoading = signal(true);
  statusFilter = '';
  showAssignModal = signal(false);
  assigningBooking = signal<BookingResponse | null>(null);
  selectedHelperId = 0;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.statusFilter = params['status'] || '';
      this.loadBookings();
    });
    this.loadHelpers();
  }

  loadBookings(): void {
    this.adminService.getAllBookings().subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadHelpers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users: UserResponse[]) => {
        const helpers = users.filter(u => u.role === 'Helper');
        this.availableHelpers.set(helpers.map(h => ({ id: h.id, fullName: h.fullName, email: h.email, ratingAverage: 0 })));
      }
    });
  }

  applyFilters(): void {
    let result = this.bookings();
    if (this.statusFilter) {
      result = result.filter(b => b.status === this.statusFilter);
    }
    this.filteredBookings.set(result);
  }

  viewBooking(booking: BookingResponse): void { this.selectedBooking.set(booking); }
  closeModal(): void { this.selectedBooking.set(null); }
  
  openAssignModal(booking: BookingResponse): void {
    this.assigningBooking.set(booking);
    this.selectedHelperId = 0;
    this.showAssignModal.set(true);
  }
  closeAssignModal(): void { this.showAssignModal.set(false); }

  assignHelper(): void {
    const booking = this.assigningBooking();
    if (!booking || !this.selectedHelperId) return;
    this.adminService.assignHelper({ bookingId: booking.id, helperId: this.selectedHelperId }).subscribe({
      next: () => { alert('Gán thành công!'); this.closeAssignModal(); this.loadBookings(); },
      error: (err) => alert('Lỗi: ' + err.error?.message)
    });
  }

  confirmBooking(id: number): void {
    this.adminService.updateBookingStatus(id, { status: 2 }).subscribe({ // 2 = Confirmed
      next: () => { alert('Đã xác nhận!'); this.loadBookings(); },
      error: (err) => alert('Lỗi: ' + err.error?.message)
    });
  }

  rejectBooking(id: number): void {
    if (confirm('Từ chối đơn này?')) {
      this.adminService.updateBookingStatus(id, { status: 3 }).subscribe({ // 3 = Rejected
        next: () => { alert('Đã từ chối!'); this.loadBookings(); },
        error: (err) => alert('Lỗi: ' + err.error?.message)
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string,string> = { 'Pending': 'Chờ xử lý', 'Confirmed': 'Đã xác nhận', 'Completed': 'Hoàn thành', 'Cancelled': 'Đã hủy', 'Rejected': 'Từ chối' };
    return labels[status] || status;
  }
}
