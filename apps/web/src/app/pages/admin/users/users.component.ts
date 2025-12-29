import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserResponse } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Quản Lý Người Dùng</h2>
        <div class="header-actions">
          <select [(ngModel)]="roleFilter" (change)="filterByRole()" class="filter-select">
            <option value="">Tất cả vai trò</option>
            <option value="Customer">Khách hàng</option>
            <option value="Helper">Người giúp việc</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          @if (isLoading()) {
            <div class="loading">Đang tải...</div>
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                @for (user of filteredUsers(); track user.id) {
                  <tr>
                    <td class="font-medium">#{{ user.id }}</td>
                    <td>
                      <div class="user-cell">
                        <div class="user-avatar">{{ getInitials(user.fullName) }}</div>
                        <span>{{ user.fullName }}</span>
                      </div>
                    </td>
                    <td class="text-muted">{{ user.email }}</td>
                    <td>{{ user.phoneNumber }}</td>
                    <td>
                      <span class="role-badge" [class]="getRoleClass(user.role)">
                        {{ getRoleLabel(user.role) }}
                      </span>
                    </td>
                    <td class="text-muted">{{ user.createdAt | date:'dd/MM/yyyy' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="empty-state">Không có người dùng nào</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.9rem;
      background: white;
      cursor: pointer;
    }

    .card {
      background: white;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .table-container { overflow-x: auto; }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .data-table th {
      text-align: left;
      padding: 1rem 1.5rem;
      background: #f6f8f8;
      color: #638884;
      font-weight: 500;
      font-size: 0.75rem;
      text-transform: uppercase;
    }

    .data-table td {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .data-table tr:hover { background: #f9fafb; }

    .font-medium { font-weight: 500; }
    .text-muted { color: #638884; }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #13b9a5 0%, #0f9685 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.75rem;
    }

    .role-badge {
      display: inline-flex;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .role-badge.customer { background: #dbeafe; color: #1d4ed8; }
    .role-badge.helper { background: #fef3c7; color: #b45309; }
    .role-badge.admin { background: #faf5ff; color: #7c3aed; }

    .loading, .empty-state {
      padding: 3rem;
      text-align: center;
      color: #638884;
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  users = signal<UserResponse[]>([]);
  filteredUsers = signal<UserResponse[]>([]);
  isLoading = signal(true);
  roleFilter = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.filteredUsers.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading.set(false);
      }
    });
  }

  filterByRole(): void {
    if (!this.roleFilter) {
      this.filteredUsers.set(this.users());
    } else {
      this.filteredUsers.set(
        this.users().filter(u => u.role === this.roleFilter)
      );
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getRoleClass(role: string): string {
    return role.toLowerCase();
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'Customer': 'Khách hàng',
      'Helper': 'Người giúp việc',
      'Admin': 'Quản trị viên'
    };
    return labels[role] || role;
  }
}
