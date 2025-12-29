import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  selector: 'app-helper-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Lịch Làm Việc</h2>
        <div class="month-nav">
          <button (click)="prevMonth()">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <span class="month-label">{{ currentMonthLabel() }}</span>
          <button (click)="nextMonth()">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading">Đang tải...</div>
      } @else {
        <div class="schedule-container">
          <!-- Calendar Grid -->
          <div class="calendar">
            <div class="calendar-header">
              @for (day of weekDays; track day) {
                <div class="day-header">{{ day }}</div>
              }
            </div>
            <div class="calendar-body">
              @for (day of calendarDays(); track $index) {
                <div class="calendar-day" 
                     [class.other-month]="!day.isCurrentMonth"
                     [class.has-jobs]="day.jobs.length > 0"
                     [class.selected]="isSelectedDate(day.date)"
                     (click)="selectDate(day.date)">
                  <span class="day-number">{{ day.day }}</span>
                  @if (day.jobs.length > 0) {
                    <span class="job-count">{{ day.jobs.length }}</span>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Selected Day Jobs -->
          <div class="day-jobs">
            <h3>{{ selectedDateLabel() }}</h3>
            @if (selectedDayJobs().length === 0) {
              <div class="empty">Không có công việc</div>
            } @else {
              @for (job of selectedDayJobs(); track job.id) {
                <div class="job-card">
                  <div class="job-header">
                    <span class="job-time">{{ job.workShiftStart }} - {{ job.workShiftEnd }}</span>
                    <span class="job-status" [class]="job.status.toLowerCase()">{{ getStatusLabel(job.status) }}</span>
                  </div>
                  <h4>{{ job.serviceName }}</h4>
                  <p><span class="material-symbols-outlined">person</span> {{ job.customerName }}</p>
                  <p><span class="material-symbols-outlined">location_on</span> {{ job.address }}</p>
                  <div class="job-price">{{ job.totalPrice | number }}₫</div>
                </div>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
    .month-nav { display: flex; align-items: center; gap: 1rem; }
    .month-nav button { background: none; border: none; cursor: pointer; padding: 0.5rem; border-radius: 8px; color: #638884; }
    .month-nav button:hover { background: #f6f8f8; }
    .month-label { font-weight: 600; min-width: 140px; text-align: center; }
    .loading { padding: 3rem; text-align: center; color: #638884; }
    .schedule-container { display: grid; grid-template-columns: 1fr 350px; gap: 1.5rem; }
    @media (max-width: 1024px) { .schedule-container { grid-template-columns: 1fr; } }
    .calendar { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
    .calendar-header { display: grid; grid-template-columns: repeat(7, 1fr); background: #f6f8f8; }
    .day-header { padding: 1rem; text-align: center; font-size: 0.8rem; font-weight: 600; color: #638884; text-transform: uppercase; }
    .calendar-body { display: grid; grid-template-columns: repeat(7, 1fr); }
    .calendar-day { padding: 1rem; text-align: center; cursor: pointer; position: relative; min-height: 60px; border-top: 1px solid #e5e7eb; transition: background 0.2s; }
    .calendar-day:hover { background: #f6f8f8; }
    .calendar-day.other-month { color: #d1d5db; }
    .calendar-day.has-jobs { background: rgba(19, 185, 165, 0.1); }
    .calendar-day.selected { background: #13b9a5; color: white; }
    .calendar-day.selected .job-count { background: white; color: #13b9a5; }
    .day-number { font-weight: 500; }
    .job-count { position: absolute; bottom: 4px; right: 4px; width: 20px; height: 20px; background: #13b9a5; color: white; border-radius: 50%; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; font-weight: 600; }
    .day-jobs { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 1.5rem; }
    .day-jobs h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 600; }
    .empty { color: #638884; text-align: center; padding: 2rem; }
    .job-card { background: #f6f8f8; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
    .job-card:last-child { margin-bottom: 0; }
    .job-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .job-time { font-weight: 600; color: #1d4ed8; }
    .job-status { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; }
    .job-status.confirmed { background: #dbeafe; color: #1d4ed8; }
    .job-status.completed { background: #dcfce7; color: #16a34a; }
    .job-status.pending { background: #fef3c7; color: #b45309; }
    .job-card h4 { margin: 0 0 0.5rem; font-size: 0.95rem; }
    .job-card p { margin: 0.25rem 0; font-size: 0.85rem; color: #638884; display: flex; align-items: center; gap: 0.25rem; }
    .job-card p .material-symbols-outlined { font-size: 16px; }
    .job-price { margin-top: 0.75rem; font-weight: 700; color: #13b9a5; }
  `]
})
export class HelperScheduleComponent implements OnInit {
  private readonly http = inject(HttpClient);

  weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  currentDate = new Date();
  selectedDate = signal(new Date());
  isLoading = signal(true);
  scheduleData = signal<ScheduleItem[]>([]);
  calendarDays = signal<{day: number, date: Date, isCurrentMonth: boolean, jobs: ScheduleItem[]}[]>([]);
  selectedDayJobs = signal<ScheduleItem[]>([]);

  ngOnInit(): void {
    this.loadMonth();
  }

  currentMonthLabel(): string {
    return this.currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  }

  selectedDateLabel(): string {
    return this.selectedDate().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.loadMonth();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.loadMonth();
  }

  loadMonth(): void {
    this.isLoading.set(true);
    const from = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const to = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

    this.http.get<ScheduleItem[]>(`${environment.apiUrl}/bookings/my-schedule`, {
      params: {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0]
      }
    }).subscribe({
      next: (data) => {
        this.scheduleData.set(data);
        this.buildCalendar(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.buildCalendar([]);
        this.isLoading.set(false);
      }
    });
  }

  buildCalendar(data: ScheduleItem[]): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const days: {day: number, date: Date, isCurrentMonth: boolean, jobs: ScheduleItem[]}[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      days.push({ day: d, date: new Date(year, month - 1, d), isCurrentMonth: false, jobs: [] });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      const jobs = data.filter(j => j.startDate.split('T')[0] === dateStr);
      days.push({ day: d, date, isCurrentMonth: true, jobs });
    }

    // Next month days
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, date: new Date(year, month + 1, d), isCurrentMonth: false, jobs: [] });
    }

    this.calendarDays.set(days);
  }

  selectDate(date: Date): void {
    this.selectedDate.set(date);
    const dateStr = date.toISOString().split('T')[0];
    const jobs = this.scheduleData().filter(j => j.startDate.split('T')[0] === dateStr);
    this.selectedDayJobs.set(jobs);
  }

  isSelectedDate(date: Date): boolean {
    return date.toDateString() === this.selectedDate().toDateString();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'Pending': 'Chờ xử lý',
      'Confirmed': 'Đã xác nhận',
      'Completed': 'Hoàn thành'
    };
    return labels[status] || status;
  }
}
