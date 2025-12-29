import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Xin chào, {{ userName() }}!</h1>
        <p class="subtitle">Đây là tổng quan công việc của bạn</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon today">
            <span class="material-symbols-outlined">today</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ todayJobs() }}</span>
            <span class="stat-label">Công việc hôm nay</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon upcoming">
            <span class="material-symbols-outlined">event_upcoming</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ upcomingJobs() }}</span>
            <span class="stat-label">Việc sắp tới</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon completed">
            <span class="material-symbols-outlined">task_alt</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ completedJobs() }}</span>
            <span class="stat-label">Đã hoàn thành</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon earnings">
            <span class="material-symbols-outlined">payments</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ monthlyEarnings() | number }}₫</span>
            <span class="stat-label">Thu nhập tháng</span>
          </div>
        </div>
      </div>

      <!-- Today's Schedule -->
      <div class="section">
        <h2>Lịch Hôm Nay</h2>
        @if (isLoading()) {
          <div class="loading">Đang tải...</div>
        } @else if (todaySchedule().length === 0) {
          <div class="empty-card">
            <span class="material-symbols-outlined">event_available</span>
            <p>Không có công việc nào hôm nay</p>
          </div>
        } @else {
          <div class="schedule-list">
            @for (job of todaySchedule(); track job.id) {
              <div class="job-card">
                <div class="job-time">
                  <span class="material-symbols-outlined">schedule</span>
                  {{ job.workShiftStart }} - {{ job.workShiftEnd }}
                </div>
                <div class="job-details">
                  <h3>{{ job.serviceName }}</h3>
                  <p class="job-customer">
                    <span class="material-symbols-outlined">person</span>
                    {{ job.customerName }}
                  </p>
                  <p class="job-address">
                    <span class="material-symbols-outlined">location_on</span>
                    {{ job.address }}
                  </p>
                </div>
                <div class="job-price">{{ job.totalPrice | number }}₫</div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 2rem; }
    .page-header h1 { margin: 0; font-size: 1.75rem; font-weight: 700; color: #111817; }
    .subtitle { margin: 0.5rem 0 0; color: #638884; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .stat-card { background: white; border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; border: 1px solid #e5e7eb; }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.today { background: #dbeafe; color: #1d4ed8; }
    .stat-icon.upcoming { background: #fef3c7; color: #b45309; }
    .stat-icon.completed { background: #dcfce7; color: #16a34a; }
    .stat-icon.earnings { background: #f3e8ff; color: #7c3aed; }
    .stat-icon .material-symbols-outlined { font-size: 24px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #111817; }
    .stat-label { font-size: 0.8rem; color: #638884; }
    .section h2 { margin: 0 0 1rem; font-size: 1.25rem; font-weight: 600; }
    .loading { padding: 2rem; text-align: center; color: #638884; }
    .empty-card { background: white; border-radius: 12px; padding: 3rem; text-align: center; border: 1px solid #e5e7eb; }
    .empty-card .material-symbols-outlined { font-size: 48px; color: #d1d5db; }
    .empty-card p { margin: 1rem 0 0; color: #638884; }
    .schedule-list { display: flex; flex-direction: column; gap: 1rem; }
    .job-card { background: white; border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; gap: 1.5rem; border: 1px solid #e5e7eb; }
    .job-time { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #dbeafe; color: #1d4ed8; border-radius: 8px; font-weight: 600; font-size: 0.9rem; white-space: nowrap; }
    .job-time .material-symbols-outlined { font-size: 18px; }
    .job-details { flex: 1; }
    .job-details h3 { margin: 0; font-size: 1rem; font-weight: 600; color: #111817; }
    .job-customer, .job-address { margin: 0.25rem 0 0; font-size: 0.85rem; color: #638884; display: flex; align-items: center; gap: 0.25rem; }
    .job-customer .material-symbols-outlined, .job-address .material-symbols-outlined { font-size: 16px; }
    .job-price { font-size: 1.1rem; font-weight: 700; color: #13b9a5; }
  `]
})
export class HelperDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  userName = signal('');
  isLoading = signal(true);
  todaySchedule = signal<ScheduleItem[]>([]);
  
  todayJobs = signal(0);
  upcomingJobs = signal(0);
  completedJobs = signal(0);
  monthlyEarnings = signal(0);

  ngOnInit(): void {
    const email = this.authService.currentUser()?.email || '';
    this.userName.set(email.split('@')[0]);
    this.loadSchedule();
  }

  loadSchedule(): void {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.http.get<ScheduleItem[]>(`${environment.apiUrl}/bookings/my-schedule`, {
      params: {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0]
      }
    }).subscribe({
      next: (data) => {
        const todayStr = today.toISOString().split('T')[0];
        const todayItems = data.filter(d => d.startDate.split('T')[0] === todayStr);
        this.todaySchedule.set(todayItems);
        this.todayJobs.set(todayItems.length);

        const upcoming = data.filter(d => 
          d.startDate.split('T')[0] > todayStr && 
          (d.status === 'Confirmed' || d.status === 'Pending')
        );
        this.upcomingJobs.set(upcoming.length);

        const completed = data.filter(d => d.status === 'Completed');
        this.completedJobs.set(completed.length);
        this.monthlyEarnings.set(completed.reduce((sum, d) => sum + d.totalPrice, 0));

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
