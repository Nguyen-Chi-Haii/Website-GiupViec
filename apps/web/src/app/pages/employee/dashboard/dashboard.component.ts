import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class EmployeeDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  stats = signal<AdminStats | null>(null);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.adminService.getEmployeeStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Error loading employee stats:', err)
    });
  }
}
