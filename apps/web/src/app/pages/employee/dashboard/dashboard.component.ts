import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminStats, BookingResponse } from '../../../core/services/admin.service';
import { DateRangePickerComponent } from '../../../shared/components/date-range-picker/date-range-picker.component';

import { RevenueChartComponent } from '../../admin/dashboard/revenue-chart/revenue-chart.component';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DateRangePickerComponent, RevenueChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class EmployeeDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  stats = signal<AdminStats | null>(null);
  recentBookings = signal<BookingResponse[]>([]);
  isLoading = signal(true);
  
  startDate = signal<string>('');
  endDate = signal<string>('');

  ngOnInit(): void {
    this.calculateDefaultMonth();
    this.loadStats();
  }

  calculateDefaultMonth() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.startDate.set(this.formatDate(start));
    this.endDate.set(this.formatDate(end));
  }

  loadStats(): void {
    this.isLoading.set(true);
    // Load stats
    this.adminService.getEmployeeStats(this.startDate(), this.endDate()).subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Error loading employee stats:', err)
    });

    // Load recent bookings
    this.adminService.getAllBookings(1, 10).subscribe({
      next: (result) => {
        // Show only newest 5 bookings for dashboard overview
        this.recentBookings.set(result.items.slice(0, 5));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.isLoading.set(false);
      }
    });
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

  onDateRangeChange(range: { startDate: string, endDate: string }) {
    this.startDate.set(range.startDate);
    this.endDate.set(range.endDate);
    this.loadStats();
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
