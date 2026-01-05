import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService, HelperDashboardStats, HelperProfile } from '../../../core/services/admin.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { RouterLink } from '@angular/router';

interface ScheduleItem {
  id: number;
  serviceName: string;
  customerName: string;
  address: string;
  startDate: string;
  endDate: string;
  workShiftStart: string;
  workShiftEnd: string;
  status: string;
  totalPrice: number;
}

@Component({
  selector: 'app-helper-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div class="header-main">
          <h1>Xin chào, {{ userName() }}!</h1>
          @if (profile()) {
            <span class="status-badge" [class]="profileStatusClass()">
              {{ profile()!.status === 1 ? 'Đang hoạt động' : 'Tạm dừng/Chưa kích hoạt' }}
            </span>
          }
        </div>
        <p class="subtitle">Đây là tổng quan công việc của bạn hôm nay, {{ todayDate | date:'dd/MM/yyyy' }}</p>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon today">
            <span class="material-symbols-outlined">today</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats()?.totalUpcomingJobs || 0 }}</span>
            <span class="stat-label">Việc sắp tới</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon rating">
            <span class="material-symbols-outlined">star</span>
          </div>
          <div class="stat-info">
            <div class="rating-value">
              <span class="stat-value">{{ stats()?.averageRating | number:'1.1-1' }}</span>
              <span class="rating-count">({{ stats()?.ratingCount || 0 }} đánh giá)</span>
            </div>
            <span class="stat-label">Điểm đánh giá</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon completed">
            <span class="material-symbols-outlined">task_alt</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats()?.totalCompletedJobs || 0 }}</span>
            <span class="stat-label">Đã hoàn thành</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon earnings">
            <span class="material-symbols-outlined">payments</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats()?.totalEarnings || 0 | number }}₫</span>
            <span class="stat-label">Tổng thu nhập</span>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- Today's Schedule -->
        <div class="section main-section">
          <div class="section-header">
            <h2>Lịch Làm Việc Hôm Nay</h2>
            <a routerLink="/helper/schedule" class="link-btn">Xem tất cả lịch</a>
          </div>
          
          @if (isLoading()) {
            <div class="loading">Đang tải...</div>
          } @else if (todaySchedule().length === 0) {
            <div class="empty-card">
              <div class="empty-icon">
                <span class="material-symbols-outlined">event_available</span>
              </div>
              <p>Hôm nay bạn không có lịch làm việc nào.</p>
              <button routerLink="/helper/schedule" class="btn-outline">Xem lịch của tôi</button>
            </div>
          } @else {
            <div class="schedule-list">
              @for (job of todaySchedule(); track job.id) {
                <div class="job-card">
                  <div class="job-time">
                    <span class="time-main">{{ job.workShiftStart }} - {{ job.workShiftEnd }}</span>
                    <span class="time-label">Giờ làm việc</span>
                  </div>
                  <div class="job-details">
                    <div class="job-header">
                      <h3>{{ job.serviceName }}</h3>
                      <span class="status-indicator" [class]="job.status.toLowerCase()">
                        {{ getStatusLabel(job.status) }}
                      </span>
                    </div>
                    <p class="job-customer">
                      <span class="material-symbols-outlined">person</span>
                      {{ job.customerName }}
                    </p>
                    <p class="job-address">
                      <span class="material-symbols-outlined">location_on</span>
                      {{ job.address }}
                    </p>
                  </div>
                  <div class="job-actions">
                    <div class="job-price">{{ job.totalPrice | number }}₫</div>
                    <button class="btn-view" [routerLink]="['/helper/schedule']" [queryParams]="{bookingId: job.id}">
                      Chi tiết
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Quick Actions Sidebar -->
        <div class="section side-section">
          <h2>Truy cập nhanh</h2>
          <div class="quick-actions">
            <button routerLink="/helper/profile" class="action-card">
              <span class="material-symbols-outlined profile">person</span>
              <div class="action-info">
                <span class="action-title">Hồ sơ cá nhân</span>
                <span class="action-desc">Cập nhật thông tin và khu vực</span>
              </div>
            </button>
            <button routerLink="/helper/schedule" class="action-card">
              <span class="material-symbols-outlined schedule">calendar_month</span>
              <div class="action-info">
                <span class="action-title">Lịch trình</span>
                <span class="action-desc">Xem và quản lý lịch tháng</span>
              </div>
            </button>
            <div class="support-card">
              <span class="material-symbols-outlined">support_agent</span>
              <div class="support-info">
                <span class="title">Bạn cần hỗ trợ?</span>
                <p>Liên hệ ngay với tổng đài nhân viên để được giải đáp thắc mắc.</p>
                <a href="tel:19001234" class="btn-support">Gọi 1900 1234</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 2rem; padding-bottom: 2rem; }
    .page-header h1 { margin: 0; font-size: 2rem; font-weight: 800; color: #111817; }
    .header-main { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .status-badge.active { background: #dcfce7; color: #15803d; border: 1px solid #bdf2d5; }
    .status-badge.inactive { background: #fef2f2; color: #b91c1c; border: 1px solid #fee2e2; }
    .subtitle { margin: 0.5rem 0 0; color: #638884; font-size: 1rem; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; }
    .stat-card { background: white; border-radius: 16px; padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; border: 1px solid #e5e7eb; transition: transform 0.2s, box-shadow 0.2s; }
    .stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
    .stat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.today { background: #eff6ff; color: #2563eb; }
    .stat-icon.rating { background: #fffbeb; color: #d97706; }
    .stat-icon.completed { background: #f0fdf4; color: #16a34a; }
    .stat-icon.earnings { background: #f5f3ff; color: #7c3aed; }
    .stat-icon .material-symbols-outlined { font-size: 28px; }
    
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.75rem; font-weight: 800; color: #111817; line-height: 1.2; }
    .stat-label { font-size: 0.875rem; color: #638884; font-weight: 500; }
    .rating-value { display: flex; align-items: baseline; gap: 0.5rem; }
    .rating-count { font-size: 0.75rem; color: #94a3b8; }

    .dashboard-content { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; }
    @media (max-width: 1024px) { .dashboard-content { grid-template-columns: 1fr; } }

    .section h2 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #111817; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .link-btn { color: #13b9a5; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    .link-btn:hover { text-decoration: underline; }

    .schedule-list { display: flex; flex-direction: column; gap: 1rem; }
    .job-card { background: white; border-radius: 16px; padding: 1.25rem; display: flex; align-items: stretch; gap: 1.5rem; border: 1px solid #e5e7eb; }
    
    .job-time { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0 1.25rem; border-right: 1px solid #f1f5f9; min-width: 140px; }
    .time-main { font-size: 1.125rem; font-weight: 700; color: #1e293b; }
    .time-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    
    .job-details { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
    .job-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem; }
    .job-details h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a; }
    .status-indicator { font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
    .status-indicator.confirmed { background: #dbeafe; color: #1e4ed8; }
    .status-indicator.pending { background: #fef3c7; color: #92400e; }
    
    .job-customer, .job-address { margin: 0; font-size: 0.9rem; color: #475569; display: flex; align-items: center; gap: 0.5rem; }
    .job-customer .material-symbols-outlined, .job-address .material-symbols-outlined { font-size: 18px; color: #94a3b8; }
    
    .job-actions { display: flex; flex-direction: column; items-end; justify-content: space-between; text-align: right; }
    .job-price { font-size: 1.25rem; font-weight: 800; color: #13b9a5; }
    .btn-view { background: #f1f5f9; color: #475569; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-view:hover { background: #e2e8f0; color: #0f172a; }

    .empty-card { background: white; border-radius: 16px; padding: 3rem; text-align: center; border: 1px solid #e5e7eb; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .empty-icon { width: 64px; height: 64px; border-radius: 50%; background: #f8fafc; display: flex; align-items: center; justify-content: center; color: #cbd5e1; }
    .empty-icon .material-symbols-outlined { font-size: 32px; }
    .empty-card p { margin: 0; color: #64748b; font-size: 1rem; }
    .btn-outline { padding: 0.6rem 1.2rem; background: transparent; border: 1px solid #e2e8f0; border-radius: 8px; color: #475569; font-weight: 600; cursor: pointer; }

    .quick-actions { display: flex; flex-direction: column; gap: 1rem; }
    .action-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1rem; display: flex; align-items: center; gap: 1rem; text-align: left; cursor: pointer; transition: all 0.2s; width: 100%; }
    .action-card:hover { border-color: #13b9a5; background: #f0fdfa; transform: translateX(5px); }
    .action-card .material-symbols-outlined { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
    .action-card .profile { background: #eff6ff; color: #3b82f6; }
    .action-card .schedule { background: #f0fdf4; color: #16a34a; }
    .action-title { display: block; font-weight: 700; color: #1e293b; font-size: 0.95rem; }
    .action-desc { font-size: 0.75rem; color: #64748b; }

    .support-card { background: #0f172a; border-radius: 16px; padding: 1.5rem; color: white; display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; position: relative; overflow: hidden; }
    .support-card::after { content: '🙋'; position: absolute; right: -10px; bottom: -10px; font-size: 80px; opacity: 0.1; transform: rotate(-15deg); }
    .support-card .material-symbols-outlined { background: rgba(255, 255, 255, 0.1); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .support-info .title { font-weight: 700; font-size: 1.1rem; }
    .support-info p { font-size: 0.85rem; opacity: 0.7; margin: 0.5rem 0 1rem; line-height: 1.5; }
    .btn-support { display: inline-block; background: #13b9a5; color: white; padding: 0.6rem 1.2rem; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 0.9rem; text-align: center; }
  `]
})
export class HelperDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly http = inject(HttpClient);

  userName = signal('');
  isLoading = signal(true);
  todaySchedule = signal<ScheduleItem[]>([]);
  stats = signal<HelperDashboardStats | null>(null);
  profile = signal<HelperProfile | null>(null);
  todayDate = new Date();

  ngOnInit(): void {
    const user = this.authService.currentUser();
    this.userName.set(user?.email?.split('@')[0] || 'User');
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    // Load statistics from the dedicated API
    this.adminService.getHelperStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Error loading stats:', err)
    });

    // Load profile to get status
    const user = this.authService.currentUser();
    if (user?.nameid) {
      const userId = parseInt(user.nameid);
      this.adminService.getHelperProfile(userId).subscribe({
        next: (data) => this.profile.set(data),
        error: (err) => console.error('Error loading profile:', err)
      });
    }

    // Load today's specific schedule
    const today = new Date();
    const from = today.toISOString().split('T')[0];
    const to = from;

    this.http.get<ScheduleItem[]>(`${environment.apiUrl}/bookings/my-schedule`, {
      params: { from, to }
    }).subscribe({
      next: (data) => {
        this.todaySchedule.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  profileStatusClass(): string {
    return this.profile()?.status === 1 ? 'active' : 'inactive';
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
