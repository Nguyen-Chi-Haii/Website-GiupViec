import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserResponse, UserUpdate } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AddressSelectorComponent, AddressResult } from '../../../shared/components/address-selector/address-selector.component';

@Component({
  selector: 'app-employee-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressSelectorComponent],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class EmployeeCustomersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly notification = inject(NotificationService);

  customers = signal<UserResponse[]>([]);
  filteredCustomers = signal<UserResponse[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  editingId = 0;
  searchQuery = '';
  statusFilter = '';

  formData = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    status: 1
  };

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.adminService.getAllUsers(1, 100).subscribe({
      next: (result) => {
        const customers = result.items.filter(u => this.normalizeRole(u.role) === 'customer');
        this.customers.set(customers);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  applyFilters(): void {
    let result = this.customers();
    
    // Search
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      result = result.filter(u => 
        u.fullName.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      );
    }

    // Status
    if (this.statusFilter) {
      result = result.filter(u => {
        const isActive = this.isUserActive(u.status);
        return this.statusFilter === 'active' ? isActive : !isActive;
      });
    }

    this.filteredCustomers.set(result);
  }

  openEditModal(user: UserResponse): void {
    this.editingId = user.id;
    this.formData = {
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      status: this.isUserActive(user.status) ? 1 : 2
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onAddressChange(result: AddressResult): void {
    this.formData.address = result.fullAddress;
  }

  saveUser(): void {
    if (!this.formData.fullName) {
      this.notification.warning('Vui lòng điền họ và tên!');
      return;
    }

    const dto: UserUpdate = {
      fullName: this.formData.fullName,
      phone: this.formData.phone,
      address: this.formData.address,
      status: this.formData.status
    };

    this.adminService.updateUser(this.editingId, dto).subscribe({
      next: () => {
        this.notification.success('Cập nhật thành công!');
        this.closeModal();
        this.loadCustomers();
      },
      error: (err) => this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể cập nhật'))
    });
  }

  async toggleStatus(user: UserResponse): Promise<void> {
    const currentActive = this.isUserActive(user.status);
    const newStatus = currentActive ? 2 : 1;
    const statusText = newStatus === 1 ? 'kích hoạt' : 'khóa';
    
    const confirmed = await this.notification.confirm(`Bạn có chắc muốn ${statusText} tài khoản "${user.fullName}"?`);
    if (confirmed) {
      this.adminService.updateUser(user.id, { status: newStatus }).subscribe({
        next: () => {
          this.notification.success(`Đã ${statusText} tài khoản thành công!`);
          this.loadCustomers();
        },
        error: (err) => this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể cập nhật'))
      });
    }
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getStatusClass(status: any): string {
    return this.isUserActive(status) ? 'active' : 'inactive';
  }

  getStatusLabel(status: any): string {
    return this.isUserActive(status) ? 'Hoạt động' : 'Khóa';
  }

  isUserActive(status: any): boolean {
    if (!status) return false;
    const s = String(status).toLowerCase();
    return s === 'active' || s === '1' || s === 'true' || s === 'hoạt động';
  }

  normalizeRole(role: any): string {
    const r = String(role || '').toLowerCase();
    if (r === '4' || r === 'customer') return 'customer';
    return r;
  }
}
