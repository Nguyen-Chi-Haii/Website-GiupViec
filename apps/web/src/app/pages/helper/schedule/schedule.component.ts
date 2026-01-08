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
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
}

@Component({
  selector: 'app-helper-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
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
  selectedJob = signal<ScheduleItem | null>(null);

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
      const jobs = data.filter(j => {
        const start = new Date(j.startDate);
        const end = new Date(j.endDate);
        const current = new Date(date);
        
        // Zero out times for date comparison
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        current.setHours(0,0,0,0);
        
        return current >= start && current <= end;
      });
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
    const jobs = this.scheduleData().filter(j => {
      const start = new Date(j.startDate);
      const end = new Date(j.endDate);
      const current = new Date(date);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      current.setHours(0,0,0,0);
      return current >= start && current <= end;
    });
    this.selectedDayJobs.set(jobs);
  }

  viewJob(job: ScheduleItem): void {
    this.selectedJob.set(job);
  }

  closeJobModal(): void {
    this.selectedJob.set(null);
  }

  isSelectedDate(date: Date): boolean {
    return date.toDateString() === this.selectedDate().toDateString();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'Pending': 'Chờ xử lý',
      'Confirmed': 'Đã xác nhận',
      'Completed': 'Hoàn thành',
      'Rejected': 'Từ chối'
    };
    return labels[status] || status;
  }
}
