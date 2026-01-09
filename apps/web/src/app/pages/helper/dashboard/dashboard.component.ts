import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService, HelperDashboardStats, HelperProfile } from '../../../core/services/admin.service';
import { BookingService } from '../../../core/services/booking.service';
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
}
