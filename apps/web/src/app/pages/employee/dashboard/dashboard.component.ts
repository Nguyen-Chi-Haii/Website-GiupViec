import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Bảng Điều Khiển Nhân Viên</h1>
        <p class="subtitle">Quản lý và xử lý đơn hàng</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">
            <span class="material-symbols-outlined">receipt_long</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().totalBookings }}</span>
            <span class="stat-label">Tổng đơn hàng</span>
          </div>
        </div>
        <a routerLink="/employee/bookings" [queryParams]="{status: 'Pending'}" class="stat-card clickable">
          <div class="stat-icon pending">
            <span class="material-symbols-outlined">pending_actions</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().pendingBookings }}</span>
            <span class="stat-label">Chờ xử lý</span>
          </div>
        </a>
        <div class="stat-card">
          <div class="stat-icon confirmed">
            <span class="material-symbols-outlined">check_circle</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().confirmedBookings }}</span>
            <span class="stat-label">Đã xác nhận</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon completed">
            <span class="material-symbols-outlined">task_alt</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().completedBookings }}</span>
            <span class="stat-label">Hoàn thành</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h2>Thao Tác Nhanh</h2>
        <div class="actions-grid">
          <a routerLink="/employee/bookings" class="action-card">
            <span class="material-symbols-outlined">list_alt</span>
            <span>Xem Tất Cả Đơn</span>
          </a>
          <a routerLink="/employee/bookings" [queryParams]="{status: 'Pending'}" class="action-card highlight">
            <span class="material-symbols-outlined">pending_actions</span>
            <span>Đơn Chờ Xử Lý ({{ stats().pendingBookings }})</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 2rem; }
    .page-header h1 { margin: 0; font-size: 1.75rem; font-weight: 700; color: #111817; }
    .subtitle { margin: 0.5rem 0 0; color: #638884; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .stat-card { background: white; border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; border: 1px solid #e5e7eb; text-decoration: none; }
    .stat-card.clickable { cursor: pointer; transition: all 0.2s; }
    .stat-card.clickable:hover { border-color: #13b9a5; box-shadow: 0 4px 12px rgba(19, 185, 165, 0.1); }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.total { background: #f3e8ff; color: #7c3aed; }
    .stat-icon.pending { background: #fef3c7; color: #b45309; }
    .stat-icon.confirmed { background: #dbeafe; color: #1d4ed8; }
    .stat-icon.completed { background: #dcfce7; color: #16a34a; }
    .stat-icon .material-symbols-outlined { font-size: 24px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #111817; }
    .stat-label { font-size: 0.8rem; color: #638884; }
    .section h2 { margin: 0 0 1rem; font-size: 1.25rem; font-weight: 600; }
    .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .action-card { display: flex; align-items: center; gap: 0.75rem; padding: 1.25rem; background: white; border: 1px solid #e5e7eb; border-radius: 12px; text-decoration: none; color: #111817; font-weight: 500; transition: all 0.2s; }
    .action-card:hover { border-color: #13b9a5; background: rgba(19, 185, 165, 0.05); }
    .action-card .material-symbols-outlined { font-size: 24px; color: #638884; }
    .action-card.highlight { background: #fef3c7; border-color: #fcd34d; }
    .action-card.highlight .material-symbols-outlined { color: #b45309; }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);

  stats = signal<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0
  });

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.http.get<any[]>(`${environment.apiUrl}/bookings`).subscribe({
      next: (data) => {
        this.stats.set({
          totalBookings: data.length,
          pendingBookings: data.filter(b => b.status === 'Pending').length,
          confirmedBookings: data.filter(b => b.status === 'Confirmed').length,
          completedBookings: data.filter(b => b.status === 'Completed').length
        });
      }
    });
  }
}
