import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserResponse, UserUpdate } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AddressSelectorComponent, AddressResult } from '../../../shared/components/address-selector/address-selector.component';
import { ChatService } from '../../../core/services/chat.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-employee-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressSelectorComponent, PaginationComponent],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class EmployeeCustomersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly notification = inject(NotificationService);
  private readonly chatService = inject(ChatService);

  customers = signal<UserResponse[]>([]);
  filteredCustomers = signal<UserResponse[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  editingId = 0;
  searchQuery = '';
  statusFilter = '';

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(1);
  totalItems = signal(0);

  // Touched state
  touchedFields = signal<Set<string>>(new Set());
  isSubmitted = signal(false);

  formData = {
    fullName: signal(''),
    email: signal(''),
    phone: signal(''),
    address: signal(''),
    status: signal(1)
  };

  errors = computed(() => {
    const errors: Record<string, string> = {};
    const fullName = this.formData.fullName().trim();
    if (!fullName || fullName.length < 2) {
      errors['fullName'] = 'Họ tên phải có ít nhất 2 ký tự';
    }
    return errors;
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading.set(true);
    // Passing the role 'Customer' to getAllUsers if the API supports it, 
    // but the current implementation filters locally after fetching.
    this.adminService.getAllUsers(this.currentPage(), this.pageSize()).subscribe({
      next: (result) => {
        const customers = result.items.filter(u => this.normalizeRole(u.role) === 'customer');
        this.customers.set(customers);
        this.filteredCustomers.set(customers);
        this.totalPages.set(Math.ceil(result.totalCount / result.pageSize));
        this.totalItems.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadCustomers();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadCustomers();
  }

  openEditModal(user: UserResponse): void {
    this.editingId = user.id;
    this.formData.fullName.set(user.fullName || '');
    this.formData.email.set(user.email || '');
    this.formData.phone.set(user.phone || '');
    this.formData.address.set(user.address || '');
    this.formData.status.set(this.isUserActive(user.status) ? 1 : 2);
    
    this.touchedFields.set(new Set());
    this.isSubmitted.set(false);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.touchedFields.set(new Set());
    this.isSubmitted.set(false);
  }

  onAddressChange(result: AddressResult): void {
    this.formData.address.set(result.fullAddress);
    this.markTouched('address');
  }

  markTouched(field: string): void {
    if (!this.touchedFields().has(field)) {
      this.touchedFields.update(prev => new Set(prev).add(field));
    }
  }

  saveUser(): void {
    this.isSubmitted.set(true);
    if (Object.keys(this.errors()).length > 0) {
      return;
    }

    const dto: UserUpdate = {
      fullName: this.formData.fullName(),
      phone: this.formData.phone(),
      address: this.formData.address(),
      status: this.formData.status()
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

  openChat(user: UserResponse): void {
    const partner = {
      userId: user.id,
      fullName: user.fullName || 'User',
      avatar: user.avatar,
      role: user.role,
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0,
      isOnline: false
    };
    
    // Set temp partner in service so ChatWidget can pick it up if not in history
    this.chatService.tempPartner.set(partner);
    this.chatService.selectedPartnerId.set(user.id);
    this.chatService.toggleChat(true);
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
