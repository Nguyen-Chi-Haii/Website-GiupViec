import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, HelperProfile } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AddressSelectorComponent, AddressResult } from '../../../shared/components/address-selector/address-selector.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-employee-helpers',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressSelectorComponent, PaginationComponent],
  templateUrl: './helpers.component.html',
  styleUrl: './helpers.component.css'
})
export class EmployeeHelpersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly notification = inject(NotificationService);

  helpers = signal<HelperProfile[]>([]);
  filteredHelpers = signal<HelperProfile[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  searchQuery = '';
  statusFilter = '';

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(1);
  totalItems = signal(0);
  
  // Touched state for real-time feedback
  touchedFields = signal<Set<string>>(new Set());
  isSubmitted = signal(false);

  formData = {
    fullName: signal(''),
    email: signal(''),
    phone: signal(''),
    password: signal(''),
    activeArea: signal(''),
    bio: signal(''),
    experienceYears: signal(0),
    hourlyRate: signal(0)
  };

  editingHelper = signal<HelperProfile | null>(null);
  isEditMode = computed(() => this.editingHelper() !== null);

  // Computed validation errors
  errors = computed(() => {
    const errors: Record<string, string> = {};
    
    if (!this.isEditMode()) {
      const fullName = this.formData.fullName().trim();
      const email = this.formData.email().trim();
      const password = this.formData.password();
      const phone = this.formData.phone().trim().replace(/\s/g, '');

      if (!fullName || fullName.length < 2) {
        errors['fullName'] = 'Họ tên phải có ít nhất 2 ký tự';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        errors['email'] = 'Email không hợp lệ';
      }

      if (!password || password.length < 6) {
        errors['password'] = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
      if (phone && !phoneRegex.test(phone)) {
        errors['phone'] = 'Số điện thoại không hợp lệ (10 số)';
      }
    }

    if (this.formData.experienceYears() < 0) {
      errors['experienceYears'] = 'Kinh nghiệm không thể âm';
    }

    if (this.formData.hourlyRate() < 0) {
      errors['hourlyRate'] = 'Giá không thể âm';
    }

    if (!this.formData.activeArea()) {
      errors['activeArea'] = 'Vui lòng chọn khu vực hoạt động';
    }

    return errors;
  });

  ngOnInit(): void {
    this.loadHelpers();
  }

  loadHelpers(): void {
    this.isLoading.set(true);
    this.adminService.getAllHelperProfiles(
      this.currentPage(), 
      this.pageSize(),
      this.searchQuery,
      this.statusFilter
    ).subscribe({
      next: (result) => {
        this.helpers.set(result.items);
        this.filteredHelpers.set(result.items);
        this.totalPages.set(Math.ceil(result.totalCount / result.pageSize));
        this.totalItems.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading helpers:', err);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadHelpers();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadHelpers();
  }

  openCreateModal(): void {
    this.editingHelper.set(null); 
    this.formData.fullName.set('');
    this.formData.email.set('');
    this.formData.phone.set('');
    this.formData.password.set('');
    this.formData.activeArea.set('');
    this.formData.bio.set('');
    this.formData.experienceYears.set(0);
    this.formData.hourlyRate.set(0);
    
    this.touchedFields.set(new Set());
    this.isSubmitted.set(false);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingHelper.set(null);
    this.touchedFields.set(new Set());
    this.isSubmitted.set(false);
  }

  onAddressChange(result: AddressResult): void {
    this.formData.activeArea.set(result.fullAddress);
    this.markTouched('activeArea');
  }

  markTouched(field: string): void {
    if (!this.touchedFields().has(field)) {
      this.touchedFields.update(prev => new Set(prev).add(field));
    }
  }

  saveHelper(): void {
    this.isSubmitted.set(true);
    if (Object.keys(this.errors()).length > 0) {
      return;
    }

    if (this.isEditMode()) {
      const helper = this.editingHelper();
      if (!helper) return;
      const updateDto = {
        activeArea: this.formData.activeArea(),
        bio: this.formData.bio() || '',
        experienceYears: this.formData.experienceYears() || 0,
        hourlyRate: this.formData.hourlyRate() || 0
      };
      this.adminService.updateHelperProfile(helper.userId, updateDto).subscribe({
        next: () => {
          this.notification.success('Cập nhật thông tin thành công!');
          this.closeModal();
          this.loadHelpers();
        },
        error: (err) => this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể cập nhật'))
      });
    } else {
      const dto = {
        fullName: this.formData.fullName(),
        email: this.formData.email(),
        phone: this.formData.phone(),
        password: this.formData.password(),
        activeArea: this.formData.activeArea(),
        bio: this.formData.bio(),
        experienceYears: this.formData.experienceYears() || 0,
        hourlyRate: this.formData.hourlyRate() || 0
      };
      this.adminService.adminCreateHelper(dto).subscribe({
        next: () => {
          this.notification.success('Thêm người giúp việc thành công!');
          this.closeModal();
          this.loadHelpers();
        },
        error: (err) => this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể tạo helper'))
      });
    }
  }

  openEditModal(helper: HelperProfile): void {
    this.editingHelper.set(helper);
    this.formData.fullName.set(''); 
    this.formData.email.set('');
    this.formData.password.set('');
    this.formData.phone.set('');
    
    this.formData.activeArea.set(helper.activeArea);
    this.formData.bio.set(helper.bio || '');
    this.formData.experienceYears.set(helper.experienceYears || 0);
    this.formData.hourlyRate.set(helper.hourlyRate || 0);
    
    this.touchedFields.set(new Set());
    this.isSubmitted.set(false);
    this.showModal.set(true);
  }

  async toggleStatus(helper: HelperProfile): Promise<void> {
    const currentActive = this.isHelperActive(helper.status);
    const newStatus = currentActive ? 2 : 1;
    const newStatusLabel = currentActive ? 'khóa' : 'mở khóa';
    
    const confirmed = await this.notification.confirm(`Bạn có chắc muốn ${newStatusLabel} hồ sơ của "${helper.fullName}"?`);
    if (confirmed) {
      this.adminService.updateUser(helper.userId, { status: newStatus }).subscribe({
        next: () => {
          this.notification.success(`Đã ${newStatusLabel} hồ sơ thành công!`);
          this.loadHelpers();
        },
        error: (err) => this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể cập nhật trạng thái'))
      });
    }
  }

  getStatusClass(status: any): string {
    return this.isHelperActive(status) ? 'active' : 'inactive';
  }

  getStatusLabel(status: any): string {
    return this.isHelperActive(status) ? 'Hoạt động' : 'Đã khóa';
  }

  isHelperActive(status: any): boolean {
    if (status === null || status === undefined) return true;
    const s = String(status).toLowerCase();
    return s === 'active' || s === '1' || s === 'true';
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
