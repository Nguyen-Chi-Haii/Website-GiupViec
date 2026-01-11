import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminStats } from '../../../core/services/admin.service';
import { DateRangePickerComponent } from '../../../shared/components/date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DateRangePickerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class EmployeeDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  stats = signal<AdminStats | null>(null);
  
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
    this.adminService.getEmployeeStats(this.startDate(), this.endDate()).subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Error loading employee stats:', err)
    });
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
