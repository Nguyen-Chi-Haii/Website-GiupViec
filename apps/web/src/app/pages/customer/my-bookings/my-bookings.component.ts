import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Booking {
  id: number;
  serviceName: string;
  helperName?: string;
  address: string;
  startDate: string;
  endDate: string;
  workShiftStart: string;
  workShiftEnd: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  createdAt: string;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Đơn Của Tôi</h2>
        <a routerLink="/booking" class="btn-primary">
          <span class="material-symbols-outlined">add</span>
          Đặt Dịch Vụ Mới
        </a>
      </div>

      <!-- Stats -->
      <div class="stats">
        <div class="stat">
          <span class="stat-value">{{ totalBookings() }}</span>
          <span class="stat-label">Tổng đơn</span>
        </div>
        <div class="stat">
          <span class="stat-value pending">{{ pendingBookings() }}</span>
          <span class="stat-label">Chờ xử lý</span>
        </div>
        <div class="stat">
          <span class="stat-value confirmed">{{ confirmedBookings() }}</span>
          <span class="stat-label">Đang thực hiện</span>
        </div>
        <div class="stat">
          <span class="stat-value completed">{{ completedBookings() }}</span>
          <span class="stat-label">Hoàn thành</span>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading">Đang tải...</div>
      } @else if (bookings().length === 0) {
        <div class="empty-state">
          <span class="material-symbols-outlined">receipt_long</span>
          <h3>Chưa có đơn nào</h3>
          <p>Bạn chưa đặt dịch vụ nào. Hãy bắt đầu đặt ngay!</p>
          <a routerLink="/booking" class="btn-primary">Đặt Dịch Vụ</a>
        </div>
      } @else {
        <div class="bookings-list">
          @for (booking of bookings(); track booking.id) {
            <div class="booking-card">
              <div class="booking-header">
                <span class="booking-id">#{{ booking.id }}</span>
                <span class="status-badge" [class]="booking.status.toLowerCase()">
                  {{ getStatusLabel(booking.status) }}
                </span>
              </div>
              <h3>{{ booking.serviceName }}</h3>
              <div class="booking-info">
                <p>
                  <span class="material-symbols-outlined">calendar_month</span>
                  {{ booking.startDate | date:'dd/MM/yyyy' }}
                  @if (booking.startDate !== booking.endDate) {
                    - {{ booking.endDate | date:'dd/MM/yyyy' }}
                  }
                </p>
                <p>
                  <span class="material-symbols-outlined">schedule</span>
                  {{ booking.workShiftStart }} - {{ booking.workShiftEnd }}
                </p>
                <p>
                  <span class="material-symbols-outlined">location_on</span>
                  {{ booking.address }}
                </p>
                @if (booking.helperName) {
                  <p>
                    <span class="material-symbols-outlined">person</span>
                    {{ booking.helperName }}
                  </p>
                }
              </div>
              <div class="booking-footer">
                <span class="payment-badge" [class]="booking.paymentStatus?.toLowerCase() || 'unpaid'">
                  {{ booking.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
                </span>
                <span class="price">{{ booking.totalPrice | number }}₫</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
    .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: #13b9a5; color: white; text-decoration: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; }
    .btn-primary:hover { background: #0f9685; }
    .stats { display: flex; gap: 1rem; flex-wrap: wrap; }
    .stat { background: white; border-radius: 12px; padding: 1rem 1.5rem; border: 1px solid #e5e7eb; text-align: center; min-width: 120px; }
    .stat-value { display: block; font-size: 1.5rem; font-weight: 700; color: #111817; }
    .stat-value.pending { color: #b45309; }
    .stat-value.confirmed { color: #1d4ed8; }
    .stat-value.completed { color: #16a34a; }
    .stat-label { font-size: 0.8rem; color: #638884; }
    .loading { padding: 3rem; text-align: center; color: #638884; }
    .empty-state { background: white; border-radius: 12px; padding: 3rem; text-align: center; border: 1px solid #e5e7eb; }
    .empty-state .material-symbols-outlined { font-size: 64px; color: #d1d5db; }
    .empty-state h3 { margin: 1rem 0 0.5rem; }
    .empty-state p { margin: 0 0 1.5rem; color: #638884; }
    .bookings-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
    .booking-card { background: white; border-radius: 12px; padding: 1.25rem; border: 1px solid #e5e7eb; }
    .booking-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .booking-id { font-weight: 600; color: #638884; }
    .status-badge { font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: 500; }
    .status-badge.pending { background: #fef3c7; color: #b45309; }
    .status-badge.confirmed { background: #dbeafe; color: #1d4ed8; }
    .status-badge.completed { background: #dcfce7; color: #16a34a; }
    .status-badge.cancelled, .status-badge.rejected { background: #f3f4f6; color: #6b7280; }
    .booking-card h3 { margin: 0 0 0.75rem; font-size: 1.1rem; }
    .booking-info p { margin: 0.25rem 0; font-size: 0.85rem; color: #638884; display: flex; align-items: center; gap: 0.5rem; }
    .booking-info .material-symbols-outlined { font-size: 18px; color: #13b9a5; }
    .booking-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; }
    .payment-badge { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; }
    .payment-badge.paid { background: #dcfce7; color: #16a34a; }
    .payment-badge.unpaid { background: #fef2f2; color: #dc2626; }
    .price { font-size: 1.1rem; font-weight: 700; color: #13b9a5; }
  `]
})
export class CustomerMyBookingsComponent implements OnInit {
  private readonly http = inject(HttpClient);

  isLoading = signal(true);
  bookings = signal<Booking[]>([]);
  
  totalBookings = signal(0);
  pendingBookings = signal(0);
  confirmedBookings = signal(0);
  completedBookings = signal(0);

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.http.get<Booking[]>(`${environment.apiUrl}/bookings`).subscribe({
      next: (data) => {
        // Sort by newest first
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.bookings.set(data);
        
        this.totalBookings.set(data.length);
        this.pendingBookings.set(data.filter(b => b.status === 'Pending').length);
        this.confirmedBookings.set(data.filter(b => b.status === 'Confirmed').length);
        this.completedBookings.set(data.filter(b => b.status === 'Completed').length);
        
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
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
}
