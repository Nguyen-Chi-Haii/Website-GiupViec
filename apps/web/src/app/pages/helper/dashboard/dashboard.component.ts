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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
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
