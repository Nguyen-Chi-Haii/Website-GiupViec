import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div class="header-content">
          <h1>Tổng Quan Vận Hành</h1>
          <p class="subtitle">Chào mừng trở lại! Dưới đây là tình hình hoạt động hôm nay.</p>
        </div>
      </div>

      <!-- Key Stats -->
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-icon bookings">
            <span class="material-symbols-outlined">receipt_long</span>
          </div>
          <div class="stat-details">
            <span class="label">Tổng đơn hàng</span>
            <span class="value">{{ stats()?.totalBookings || 0 }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pending">
            <span class="material-symbols-outlined">pending_actions</span>
          </div>
          <div class="stat-details">
            <span class="label">Chờ xử lý</span>
            <span class="value highlight">{{ stats()?.pendingBookings || 0 }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon helpers">
            <span class="material-symbols-outlined">engineering</span>
          </div>
          <div class="stat-details">
            <span class="label">Người giúp việc</span>
            <span class="value">{{ stats()?.totalHelpers || 0 }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon customers">
            <span class="material-symbols-outlined">person</span>
          </div>
          <div class="stat-details">
            <span class="label">Khách hàng</span>
            <span class="value">{{ stats()?.totalCustomers || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Management Quick Access -->
      <div class="section">
        <div class="section-header">
          <h2>Quản Lý Hệ Thống</h2>
        </div>
        <div class="management-grid">
          <a routerLink="/employee/bookings" class="mgmt-card">
            <div class="card-icon blue">
              <span class="material-symbols-outlined">receipt_long</span>
            </div>
            <div class="card-info">
              <h3>Đơn Hàng</h3>
              <p>Xử lý, phân bổ và theo dõi trạng thái các đơn hàng.</p>
            </div>
            <span class="material-symbols-outlined arrow">chevron_right</span>
          </a>

          <a routerLink="/employee/helpers" class="mgmt-card">
            <div class="card-icon purple">
              <span class="material-symbols-outlined">engineering</span>
            </div>
            <div class="card-info">
              <h3>Người Giúp Việc</h3>
              <p>Quản lý hồ sơ, kỹ năng và lịch trình của cộng tác viên.</p>
            </div>
            <span class="material-symbols-outlined arrow">chevron_right</span>
          </a>

          <a routerLink="/employee/customers" class="mgmt-card">
            <div class="card-icon orange">
              <span class="material-symbols-outlined">group</span>
            </div>
            <div class="card-info">
              <h3>Khách Hàng</h3>
              <p>Xem thông tin chi tiết và lịch sử đặt dịch vụ của khách.</p>
            </div>
            <span class="material-symbols-outlined arrow">chevron_right</span>
          </a>

          <a routerLink="/employee/calendar" class="mgmt-card">
            <div class="card-icon green">
              <span class="material-symbols-outlined">calendar_month</span>
            </div>
            <div class="card-info">
              <h3>Lịch Vận Hành</h3>
              <p>Theo dõi tổng quan lịch làm việc của tất cả các đơn hàng.</p>
            </div>
            <span class="material-symbols-outlined arrow">chevron_right</span>
          </a>

          <a routerLink="/employee/services" class="mgmt-card">
            <div class="card-icon teal">
              <span class="material-symbols-outlined">service_toolbox</span>
            </div>
            <div class="card-info">
              <h3>Dịch Vụ</h3>
              <p>Thiết lập danh mục dịch vụ và điều chỉnh bảng giá.</p>
            </div>
            <span class="material-symbols-outlined arrow">chevron_right</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 2.5rem; }
    
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
    .page-header h1 { margin: 0; font-size: 2rem; font-weight: 800; color: #111817; letter-spacing: -0.02em; }
    .subtitle { margin: 0.5rem 0 0; color: #638884; font-size: 1.1rem; }

    .stats-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
    .stat-card {
      background: white; border-radius: 20px; padding: 1.75rem; 
      display: flex; align-items: center; gap: 1.25rem;
      border: 1px solid rgba(229, 231, 235, 0.5);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.08); border-color: #13b9a5; }

    .stat-icon {
      width: 56px; height: 56px; border-radius: 16px; 
      display: flex; align-items: center; justify-content: center;
      font-size: 28px;
    }
    .stat-icon.bookings { background: #eff6ff; color: #1d4ed8; }
    .stat-icon.pending { background: #fffbeb; color: #b45309; }
    .stat-icon.helpers { background: #f5f3ff; color: #6d28d9; }
    .stat-icon.customers { background: #ecfdf5; color: #059669; }

    .stat-details { display: flex; flex-direction: column; gap: 2px; }
    .stat-details .label { font-size: 0.875rem; color: #638884; font-weight: 500; }
    .stat-details .value { font-size: 1.75rem; font-weight: 800; color: #111817; }
    .value.highlight { color: #d97706; }

    .section-header { margin-bottom: 1.5rem; }
    .section-header h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #111817; }

    .management-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; }
    .mgmt-card {
      background: white; border-radius: 20px; padding: 1.5rem;
      display: flex; align-items: center; gap: 1.25rem;
      border: 1px solid #e5e7eb; text-decoration: none; color: inherit;
      transition: all 0.2s;
    }
    .mgmt-card:hover { background: #f9fafb; border-color: #13b9a5; }

    .card-icon {
      width: 52px; height: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .card-icon.blue { background: #e0f2fe; color: #0369a1; }
    .card-icon.purple { background: #f3e8ff; color: #7e22ce; }
    .card-icon.orange { background: #ffedd5; color: #c2410c; }
    .card-icon.green { background: #dcfce7; color: #15803d; }
    .card-icon.teal { background: #ccfbf1; color: #0f766e; }

    .card-info { flex: 1; }
    .card-info h3 { margin: 0 0 2px; font-size: 1.125rem; font-weight: 700; color: #111817; }
    .card-info p { margin: 0; font-size: 0.875rem; color: #638884; line-height: 1.4; }

    .arrow { color: #94a3b8; font-size: 20px; transition: transform 0.2s; }
    .mgmt-card:hover .arrow { transform: translateX(4px); color: #13b9a5; }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  stats = signal<AdminStats | null>(null);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.adminService.getEmployeeStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Error loading employee stats:', err)
    });
  }
}
