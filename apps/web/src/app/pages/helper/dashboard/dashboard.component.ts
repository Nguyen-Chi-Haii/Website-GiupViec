import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService, HelperDashboardStats, HelperProfile } from '../../../core/services/admin.service';
import { BookingService } from '../../../core/services/booking.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { RouterLink } from '@angular/router';
import { DateRangePickerComponent } from '../../../shared/components/date-range-picker/date-range-picker.component';

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
  imports: [CommonModule, RouterLink, DateRangePickerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class HelperDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly bookingService = inject(BookingService);
  private readonly http = inject(HttpClient);

  userName = signal('');
  isLoading = signal(true);
  isConfirming = signal(false);
  todaySchedule = signal<ScheduleItem[]>([]);
  stats = signal<HelperDashboardStats | null>(null);
  profile = signal<HelperProfile | null>(null);
  
  // Date filter signals
  startDate = signal<string>('');
  endDate = signal<string>('');

  ngOnInit(): void {
    const user = this.authService.currentUser();
    this.userName.set(user?.email?.split('@')[0] || 'User');
    
    // Default to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Format to yyyy-MM-dd to match picker standard (or whatever picker emits)
    // Actually DateRangePicker emits ISO string or 'yyyy-mm-dd'. 
    // Let's rely on standard ISO YYYY-MM-DD
    this.startDate.set(this.formatDate(firstDay));
    this.endDate.set(this.formatDate(lastDay));

    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    // Load statistics with date filter
    this.adminService.getHelperStats(this.startDate(), this.endDate()).subscribe({
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

    // Load today's specific schedule and any overdue ones (last 7 days)
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    const from = lastWeek.toISOString().split('T')[0];
    const to = today.toISOString().split('T')[0];

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

  canConfirm(job: ScheduleItem): boolean {
    if (job.status !== 'Confirmed') return false;

    // Time check: only after end time
    const endDateTime = new Date(job.endDate);
    const [hours, minutes] = job.workShiftEnd.split(':').map(Number);
    endDateTime.setHours(hours, minutes, 0, 0);

    return new Date() >= endDateTime;
  }

  confirmJob(job: ScheduleItem): void {
    if (!confirm('Xác nhận công việc đã hoàn thành?')) return;

    this.isConfirming.set(true);
    this.bookingService.confirmByHelper(job.id).subscribe({
      next: () => {
        alert('Đã xác nhận hoàn thành!');
        this.isConfirming.set(false);
        this.loadData();
      },
      error: (err: any) => {
        alert('Lỗi: ' + (err.error?.message || 'Không thể xác nhận'));
        this.isConfirming.set(false);
      }
    });
  }

  handleDateChange(dates: { startDate: string, endDate: string }) {
    this.startDate.set(dates.startDate);
    this.endDate.set(dates.endDate);
    this.loadData();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
