import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserResponse, UserCreate, UserUpdate } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AddressSelectorComponent, AddressResult } from '../../../shared/components/address-selector/address-selector.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressSelectorComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Quản Lý Người Dùng</h2>
        <div class="header-actions">
          <select [(ngModel)]="roleFilter" (change)="applyFilters()" class="filter-select">
            <option value="">Tất cả vai trò</option>
            <option value="Customer">Khách hàng</option>
            <option value="Employee">Nhân viên</option>
            <option value="Admin">Admin</option>
          </select>
          <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="filter-select">
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Inactive">Khóa</option>
          </select>
          <button class="btn-primary" (click)="openCreateModal()">
            <span class="material-symbols-outlined">add</span>
            Thêm User
          </button>
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
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
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
                    <td>{{ user.phone || '-' }}</td>
                    <td>
                      <span class="role-badge" [class]="getRoleClass(user.role)">
                        {{ getRoleLabel(user.role) }}
                      </span>
                    </td>
                    <td>
                      <span class="status-badge" [class]="getStatusClass(user.status)">
                        {{ getStatusLabel(user.status) }}
                      </span>
                    </td>
                    <td class="text-muted">{{ user.createdAt | date:'dd/MM/yyyy' }}</td>
                    <td>
                      <div class="action-buttons">
                        <button class="icon-btn" title="Sửa" (click)="openEditModal(user)">
                          <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="icon-btn" title="Đổi trạng thái" (click)="toggleStatus(user)">
                          <span class="material-symbols-outlined">{{ isUserActive(user.status) ? 'lock' : 'lock_open' }}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="empty-state">Không có người dùng nào</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>

      <!-- Create/Edit Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ isEditing() ? 'Sửa Người Dùng' : 'Thêm Người Dùng Mới' }}</h3>
              <button class="close-btn" (click)="closeModal()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>Họ và tên <span class="required">*</span></label>
                  <input type="text" [(ngModel)]="formData.fullName" placeholder="Nguyễn Văn A" />
                </div>
                <div class="form-group">
                  <label>Email <span class="required">*</span></label>
                  <input type="email" [(ngModel)]="formData.email" placeholder="example@email.com" [disabled]="isEditing()" />
                </div>
                <div class="form-group">
                  <label>Số điện thoại</label>
                  <input type="tel" [(ngModel)]="formData.phone" placeholder="0912345678" />
                </div>
                <div class="form-group full-width">
                  <app-address-selector 
                    [initialAddress]="formData.address"
                    (addressChange)="onAddressChange($event)"
                  ></app-address-selector>
                </div>
                @if (!isEditing()) {
                  <div class="form-group full-width">
                    <label>Mật khẩu <span class="required">*</span></label>
                    <input type="password" [(ngModel)]="formData.password" placeholder="Tối thiểu 6 ký tự" />
                  </div>
                }
                <div class="form-group">
                  <label>Vai trò <span class="required">*</span></label>
                  <select [(ngModel)]="formData.role">
                    <option value="Customer">Khách hàng</option>
                    <option value="Employee">Nhân viên</option>
                    <option value="Admin">Quản trị viên</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Trạng thái</label>
                  <select [(ngModel)]="formData.status">
                    <option [ngValue]="1">Hoạt động</option>
                    <option [ngValue]="2">Khóa</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-outline" (click)="closeModal()">Hủy</button>
              <button type="button" class="btn-submit" (click)="saveUser()">{{ isEditing() ? 'Cập nhật' : 'Tạo mới' }}</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
    .header-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .filter-select { padding: 0.5rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; background: white; cursor: pointer; }
    .btn-primary { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: #13b9a5; color: white; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn-primary:hover { background: #0f9685; }
    .btn-outline { padding: 0.75rem 1.25rem; background: transparent; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; }
    .card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .data-table th { text-align: left; padding: 1rem 1rem; background: #f6f8f8; color: #638884; font-weight: 500; font-size: 0.75rem; text-transform: uppercase; white-space: nowrap; }
    .data-table td { padding: 1rem 1rem; border-top: 1px solid #e5e7eb; }
    .data-table tr:hover { background: #f9fafb; }
    .font-medium { font-weight: 500; }
    .text-muted { color: #638884; }
    .user-cell { display: flex; align-items: center; gap: 0.75rem; }
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #13b9a5 0%, #0f9685 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.75rem; }
    .role-badge, .status-badge { display: inline-flex; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .role-badge.customer { background: #dbeafe; color: #1d4ed8; }
    .role-badge.helper { background: #fef3c7; color: #b45309; }
    .role-badge.employee { background: #f3e8ff; color: #7c3aed; }
    .role-badge.admin { background: #faf5ff; color: #7c3aed; }
    .status-badge.active { background: #dcfce7; color: #16a34a; }
    .status-badge.inactive { background: #f3f4f6; color: #6b7280; }
    .action-buttons { display: flex; gap: 0.5rem; }
    .icon-btn { min-width: 36px; min-height: 36px; width: 36px; height: 36px; border: 1px solid #e5e7eb; background: #ffffff; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; color: #13b9a5; transition: all 0.2s; padding: 0; }
    .icon-btn:hover { background: #13b9a5; color: #ffffff; border-color: #13b9a5; }
    .icon-btn .material-symbols-outlined { font-family: 'Material Symbols Outlined' !important; font-size: 20px !important; width: 20px; height: 20px; line-height: 1; display: inline-block; }
    .loading, .empty-state { padding: 3rem; text-align: center; color: #638884; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #1e2a2a; border-radius: 16px; width: 90%; max-width: 600px; max-height: 90vh; overflow: auto; color: #e5e7eb; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #374151; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #ffffff; }
    .close-btn { background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 1.5rem; }
    .close-btn:hover { color: #ffffff; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.5rem; border-top: 1px solid #374151; }
    .modal-footer .btn-outline { padding: 0.75rem 1.5rem; background: transparent; border: 1px solid #4b5563; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; color: #e5e7eb; }
    .modal-footer .btn-outline:hover { background: #374151; }
    .modal-footer .btn-submit { padding: 0.75rem 1.5rem; background: #13b9a5; color: #ffffff; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
    .modal-footer .btn-submit:hover { background: #0f9685; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .form-group { display: flex; flex-direction: column; }
    .form-group.full-width { grid-column: span 2; }
    .form-group label { font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; color: #e5e7eb; }
    .required { color: #ef4444; }
    .form-group input, .form-group select { width: 100%; padding: 0.75rem 1rem; border: 1px solid #374151; border-radius: 8px; font-size: 0.9rem; background: #2d3a3a; color: #e5e7eb; }
    .form-group input::placeholder { color: #6b7280; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #13b9a5; }
    .form-group input:disabled { background: #1f2937; cursor: not-allowed; color: #6b7280; }
    .form-group select option { background: #2d3a3a; color: #e5e7eb; }
  `]
})
export class AdminUsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly notification = inject(NotificationService);

  users = signal<UserResponse[]>([]);
  filteredUsers = signal<UserResponse[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  isEditing = signal(false);
  editingId = 0;
  
  roleFilter = '';
  statusFilter = '';

  formData = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    role: 'Customer',
    status: 1
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        // Lọc bỏ Helper ra khỏi danh sách User chung
        const nonHelpers = data.filter(u => this.normalizeRole(u.role) !== 'helper');
        this.users.set(nonHelpers);
        this.filteredUsers.set(nonHelpers);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    let result = this.users();
    if (this.roleFilter) {
      result = result.filter(u => {
        const userRole = String(u.role || '').toLowerCase();
        const filterRole = this.roleFilter.toLowerCase();
        return userRole === filterRole || this.getRoleLabel(u.role) === this.getRoleLabel(this.roleFilter);
      });
    }
    if (this.statusFilter) {
      result = result.filter(u => {
        const userStatusClass = this.getStatusClass(u.status);
        const filterStatusClass = this.statusFilter.toLowerCase();
        return userStatusClass === filterStatusClass;
      });
    }
    this.filteredUsers.set(result);
  }

  openCreateModal(): void {
    this.formData = { fullName: '', email: '', phone: '', address: '', password: '', role: 'Customer', status: 1 };
    this.isEditing.set(false);
    this.showModal.set(true);
  }

  openEditModal(user: UserResponse): void {
    // Debug: Log the raw user data from API
    console.log('Opening edit modal for user:', user);
    
    // Convert role from number/string to role name for dropdown
    // Backend enum: Admin=1, Employee=2, Helper=3, Customer=4
    const roleNumberToName: Record<string, string> = {
      '1': 'Admin', 'Admin': 'Admin',
      '2': 'Employee', 'Employee': 'Employee',
      '3': 'Helper', 'Helper': 'Helper',
      '4': 'Customer', 'Customer': 'Customer'
    };
    
    // Handle phone: API returns 'phone'
    const phoneValue = user.phone || '';
    
    // Handle status: might be number (1/2), string ('Active'/'Inactive'), or 'Hoạt động'/'Khóa'
    let statusValue = 1;
    if (typeof user.status === 'number') {
      statusValue = user.status === 2 ? 2 : 1;
    } else {
      statusValue = this.isUserActive(user.status) ? 1 : 2;
    }
    
    this.formData = {
      fullName: user.fullName || '',
      email: user.email || '',
      phone: phoneValue,
      address: user.address || '',
      password: '',
      role: roleNumberToName[String(user.role)] || 'Customer',
      status: statusValue
    };
    
    console.log('Form data after mapping:', this.formData);
    
    this.editingId = user.id;
    this.isEditing.set(true);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onAddressChange(result: AddressResult): void {
    this.formData.address = result.fullAddress;
  }

  saveUser(): void {
    if (!this.formData.fullName || !this.formData.email) {
      this.notification.warning('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    // Convert role string to number
    // Backend enum: Admin=1, Employee=2, Helper=3, Customer=4
    const roleMap: Record<string, number> = {
      'Admin': 1, 'Employee': 2, 'Helper': 3, 'Customer': 4
    };

    if (this.isEditing()) {
      const dto: UserUpdate = {
        fullName: this.formData.fullName,
        phone: this.formData.phone?.trim() ? this.formData.phone.trim() : undefined,
        address: this.formData.address?.trim() ? this.formData.address.trim() : undefined,
        role: roleMap[this.formData.role],
        status: this.formData.status
      };
      if (this.formData.password) {
        dto.password = this.formData.password;
      }

      console.log('Updating user:', this.editingId, dto);

      this.adminService.updateUser(this.editingId, dto).subscribe({
        next: (response) => {
          console.log('Update success:', response);
          this.notification.success('Cập nhật thành công!');
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          console.error('Update error:', err);
          this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể cập nhật'));
        }
      });
    } else {
      if (!this.formData.password || this.formData.password.length < 6) {
        this.notification.warning('Mật khẩu phải có ít nhất 6 ký tự!');
        return;
      }
      
      const dto: UserCreate = {
        fullName: this.formData.fullName,
        email: this.formData.email,
        phone: this.formData.phone?.trim() ? this.formData.phone.trim() : undefined,
        avatar: '', // Required by database - cannot be NULL
        address: this.formData.address?.trim() ? this.formData.address.trim() : undefined,
        password: this.formData.password,
        role: roleMap[this.formData.role] || 1,
        status: this.formData.status
      };

      this.adminService.createUser(dto).subscribe({
        next: () => {
          this.notification.success('Tạo người dùng thành công!');
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể tạo'))
      });
    }
  }

  async toggleStatus(user: UserResponse): Promise<void> {
    // Toggle: 1 (Active) <-> 2 (Inactive)
    const currentActive = this.isUserActive(user.status);
    const newStatus = currentActive ? 2 : 1;
    const statusText = newStatus === 1 ? 'kích hoạt' : 'khóa';
    
    const confirmed = await this.notification.confirm(`Bạn có chắc muốn ${statusText} tài khoản "${user.fullName}"?`);
    if (confirmed) {
      this.adminService.updateUser(user.id, { status: newStatus }).subscribe({
        next: () => {
          this.notification.success(`Đã ${statusText} tài khoản thành công!`);
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error updating status:', err);
          this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể cập nhật trạng thái'));
        }
      });
    }
  }

  getInitials(name: string | null | undefined): string {
    if (!name || typeof name !== 'string') return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getRoleClass(role: string | number | null | undefined): string {
    if (!role) return 'customer';
    // Backend enum: Admin=1, Employee=2, Helper=3, Customer=4
    const roleClasses: Record<string, string> = {
      '1': 'admin', 'Admin': 'admin',
      '2': 'employee', 'Employee': 'employee',
      '3': 'helper', 'Helper': 'helper',
      '4': 'customer', 'Customer': 'customer'
    };
    return roleClasses[String(role)] || 'customer';
  }

  getRoleLabel(role: string | number | null | undefined): string {
    const roleStr = String(role || '');
    // Backend enum: Admin=1, Employee=2, Helper=3, Customer=4
    const labels: Record<string, string> = {
      'Customer': 'Khách hàng',
      'Helper': 'Người giúp việc',
      'Employee': 'Nhân viên',
      'Admin': 'Quản trị viên',
      '1': 'Quản trị viên',     // Admin = 1
      '2': 'Nhân viên',         // Employee = 2
      '3': 'Người giúp việc',   // Helper = 3
      '4': 'Khách hàng'         // Customer = 4
    };
    return labels[roleStr] || roleStr || 'Không xác định';
  }

  getStatusClass(status: string | number | null | undefined): string {
    if (!status) return 'inactive';
    const statusStr = String(status).toLowerCase();
    if (statusStr === 'active' || statusStr === '1' || statusStr === 'true') return 'active';
    return 'inactive';
  }

  getStatusLabel(status: string | number | null | undefined): string {
    if (!status) return 'Khóa';
    const statusStr = String(status).toLowerCase();
    if (statusStr === 'active' || statusStr === '1' || statusStr === 'true') return 'Hoạt động';
    return 'Khóa';
  }

  isUserActive(status: string | number | null | undefined): boolean {
    if (!status) return false;
    const statusStr = String(status).toLowerCase();
    return statusStr === 'active' || statusStr === '1' || statusStr === 'true';
  }

  normalizeRole(role: string | number | null | undefined): string {
    const roleStr = String(role || '').toLowerCase();
    const roleMap: Record<string, string> = {
      '1': 'admin', 'admin': 'admin',
      '2': 'employee', 'employee': 'employee',
      '3': 'helper', 'helper': 'helper',
      '4': 'customer', 'customer': 'customer'
    };
    return roleMap[roleStr] || roleStr;
  }
}
