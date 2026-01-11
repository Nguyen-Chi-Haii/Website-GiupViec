import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminStats, BookingResponse } from '../../../core/services/admin.service';
import { DateRangePickerComponent } from '../../../shared/components/date-range-picker/date-range-picker.component';
import { RevenueChartComponent } from './revenue-chart/revenue-chart.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DateRangePickerComponent, RevenueChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  stats = signal<AdminStats | null>(null);
  recentBookings = signal<BookingResponse[]>([]);
  isLoading = signal(true);
  
  startDate = signal<string>('');
  endDate = signal<string>('');

  ngOnInit(): void {
    // Initial load will happen when picker emits default or manually called
    // But picker emits on init? No, picker constructor sets signals but doesn't emit.
    // Let's call loadData with empty (or default)
    this.calculateDefaultMonth();
    this.loadData();
  }

  calculateDefaultMonth() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.startDate.set(this.formatDate(start));
    this.endDate.set(this.formatDate(end));
  }

  onDateRangeChange(range: { startDate: string, endDate: string }) {
    this.startDate.set(range.startDate);
    this.endDate.set(range.endDate);
    this.loadData();
  }

  loadData(): void {
    // Load stats with date filter
    this.adminService.getAdminStats(this.startDate(), this.endDate()).subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Error loading stats:', err)
    });

    // Load recent bookings (Keep showing all recent, or filter? Usually Dashboard recent bookings are just latest)
    // We won't filter recent bookings by the stats date range to avoid confusion, 
    // or maybe we should? "Overview" typically implies "Stats for Period".
    // Let's keep recent bookings as global latest for now.
    this.adminService.getAllBookings().subscribe({
      next: (data) => {
        this.recentBookings.set(data.slice(0, 5));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.isLoading.set(false);
      }
    });
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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
