import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserResponse, UserCreate, UserUpdate } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AddressSelectorComponent, AddressResult } from '../../../shared/components/address-selector/address-selector.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressSelectorComponent, PaginationComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
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
  
  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(1);
  totalItems = signal(0);
  
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
    this.adminService.getAllUsers(this.currentPage(), this.pageSize()).subscribe({
      next: (result) => {
        // Lọc bỏ Helper ra khỏi danh sách User chung
        const nonHelpers = result.items.filter(u => this.normalizeRole(u.role) !== 'helper');
        this.users.set(nonHelpers);
        this.filteredUsers.set(nonHelpers);
        this.totalPages.set(Math.ceil(result.totalCount / result.pageSize));
        this.totalItems.set(result.totalCount);
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

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadUsers();
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
