import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminStats, BookingResponse } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon blue">
              <span class="material-symbols-outlined">group</span>
            </div>
          </div>
          <div class="stat-body">
            <p class="stat-label">Tổng người dùng</p>
            <h3 class="stat-value">{{ stats()?.totalUsers || 0 | number }}</h3>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon orange">
              <span class="material-symbols-outlined">badge</span>
            </div>
          </div>
          <div class="stat-body">
            <p class="stat-label">Tổng nhân viên</p>
            <h3 class="stat-value">{{ stats()?.totalHelpers || 0 | number }}</h3>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon purple">
              <span class="material-symbols-outlined">person_check</span>
            </div>
          </div>
          <div class="stat-body">
            <p class="stat-label">Tổng khách hàng</p>
            <h3 class="stat-value">{{ stats()?.totalCustomers || 0 | number }}</h3>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon indigo">
              <span class="material-symbols-outlined">receipt_long</span>
            </div>
          </div>
          <div class="stat-body">
            <p class="stat-label">Tổng đơn đặt</p>
            <h3 class="stat-value">{{ stats()?.totalBookings || 0 | number }}</h3>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon primary">
              <span class="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div class="stat-body">
            <p class="stat-label">Tổng doanh thu</p>
            <h3 class="stat-value">{{ stats()?.totalRevenue || 0 | number }}₫</h3>
          </div>
        </div>

        <div class="stat-card highlight">
          <div class="stat-header">
            <div class="stat-icon red">
              <span class="material-symbols-outlined">pending_actions</span>
            </div>
            <span class="stat-badge">Cần xử lý</span>
          </div>
          <div class="stat-body">
            <p class="stat-label">Đơn chờ xử lý</p>
            <h3 class="stat-value">{{ stats()?.pendingBookings || 0 }}</h3>
          </div>
        </div>
      </div>

      <!-- Recent Orders Table -->
      <div class="section-card">
        <div class="section-header">
          <h3>Đơn hàng gần đây</h3>
          <a routerLink="/admin/bookings" class="view-all">Xem tất cả</a>
        </div>
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
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                </tr>
              </thead>
              <tbody>
                @for (booking of recentBookings(); track booking.id) {
                  <tr>
                    <td class="font-medium">#{{ booking.id }}</td>
                    <td>{{ booking.customerName }}</td>
                    <td class="text-muted">{{ booking.serviceName }}</td>
                    <td>
                      <span class="status-badge" [class]="getStatusClass(booking.status)">
                        {{ getStatusLabel(booking.status) }}
                      </span>
                    </td>
                    <td class="text-muted">{{ booking.createdAt | date:'dd/MM/yyyy' }}</td>
                    <td class="font-medium">{{ booking.totalPrice | number }}₫</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="empty-state">Chưa có đơn hàng nào</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .stat-card.highlight {
      position: relative;
      overflow: hidden;
    }

    .stat-card.highlight::after {
      content: '';
      position: absolute;
      right: -30px;
      top: -30px;
      width: 100px;
      height: 100px;
      background: rgba(239, 68, 68, 0.05);
      border-radius: 50%;
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.blue { background: #eff6ff; color: #3b82f6; }
    .stat-icon.orange { background: #fff7ed; color: #f97316; }
    .stat-icon.purple { background: #faf5ff; color: #a855f7; }
    .stat-icon.indigo { background: #eef2ff; color: #6366f1; }
    .stat-icon.primary { background: rgba(19, 185, 165, 0.1); color: #13b9a5; }
    .stat-icon.red { background: #fef2f2; color: #ef4444; }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
    }

    .stat-trend.up {
      background: #dcfce7;
      color: #16a34a;
    }

    .stat-trend .material-symbols-outlined {
      font-size: 16px;
    }

    .stat-badge {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      background: #fef2f2;
      color: #ef4444;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #638884;
      margin: 0 0 0.25rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111817;
      margin: 0;
    }

    .section-card {
      background: white;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .section-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
      color: #111817;
    }

    .view-all {
      font-size: 0.875rem;
      font-weight: 600;
      color: #13b9a5;
      text-decoration: none;
    }

    .view-all:hover {
      text-decoration: underline;
    }

    .table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .data-table th {
      text-align: left;
      padding: 1rem 1.5rem;
      background: #f6f8f8;
      color: #638884;
      font-weight: 500;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .data-table td {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      color: #111817;
    }

    .data-table tr:hover {
      background: #f9fafb;
    }

    .font-medium {
      font-weight: 500;
    }

    .text-muted {
      color: #638884;
    }

    .status-badge {
      display: inline-flex;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.pending { background: #fef3c7; color: #b45309; }
    .status-badge.confirmed { background: #dbeafe; color: #1d4ed8; }
    .status-badge.completed { background: #dcfce7; color: #16a34a; }
    .status-badge.cancelled { background: #f3f4f6; color: #6b7280; }
    .status-badge.rejected { background: #fef2f2; color: #dc2626; }

    .loading, .empty-state {
      padding: 3rem;
      text-align: center;
      color: #638884;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  stats = signal<AdminStats | null>(null);
  recentBookings = signal<BookingResponse[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Load stats
    this.adminService.getAdminStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Error loading stats:', err)
    });

    // Load recent bookings
    this.adminService.getAllBookings().subscribe({
      next: (data) => {
        this.recentBookings.set(data.slice(0, 5)); // Only show 5 recent
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'Pending': 'pending',
      'Confirmed': 'confirmed',
      'Completed': 'completed',
      'Cancelled': 'cancelled',
      'Rejected': 'rejected'
    };
    return statusMap[status] || 'pending';
  }

  getStatusLabel(status: string): string {
    const labelMap: Record<string, string> = {
      'Pending': 'Chờ xử lý',
      'Confirmed': 'Đã xác nhận',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy',
      'Rejected': 'Từ chối'
    };
    return labelMap[status] || status;
  }
}
