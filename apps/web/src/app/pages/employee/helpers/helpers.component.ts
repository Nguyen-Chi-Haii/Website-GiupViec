import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, HelperProfile } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AddressSelectorComponent, AddressResult } from '../../../shared/components/address-selector/address-selector.component';

@Component({
  selector: 'app-employee-helpers',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressSelectorComponent],
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

  formData = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    activeArea: '',
    bio: '',
    experienceYears: 0,
    hourlyRate: 0
  };

  editingHelper = signal<HelperProfile | null>(null);
  isEditMode = computed(() => this.editingHelper() !== null);

  ngOnInit(): void {
    this.loadHelpers();
  }

  loadHelpers(): void {
    this.adminService.getAllHelperProfiles(1, 100).subscribe({
      next: (result) => {
        this.helpers.set(result.items);
        this.filteredHelpers.set(result.items);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading helpers:', err);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    let filtered = this.helpers();
    
    // Search filter
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(h => 
        h.fullName.toLowerCase().includes(query) || 
        h.email.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(h => {
        const isActive = this.isHelperActive(h.status);
        return this.statusFilter === 'active' ? isActive : !isActive;
      });
    }

    this.filteredHelpers.set(filtered);
  }

  openCreateModal(): void {
    this.editingHelper.set(null); 
    this.formData = {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      activeArea: '',
      bio: '',
      experienceYears: 0,
      hourlyRate: 0
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingHelper.set(null);
  }

  onAddressChange(result: AddressResult): void {
    this.formData.activeArea = result.fullAddress;
  }

  saveHelper(): void {
    if (!this.formData.activeArea) {
      this.notification.warning('Vui lòng điền khu vực hoạt động!');
      return;
    }
    if (this.isEditMode()) {
      const helper = this.editingHelper();
      if (!helper) return;
      const updateDto = {
        activeArea: this.formData.activeArea,
        bio: this.formData.bio || '',
        experienceYears: this.formData.experienceYears || 0,
        hourlyRate: this.formData.hourlyRate || 0
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
      if (!this.formData.fullName || !this.formData.email || !this.formData.password) {
        this.notification.warning('Vui lòng điền các trường bắt buộc!');
        return;
      }
      const dto = {
        fullName: this.formData.fullName,
        email: this.formData.email,
        phone: this.formData.phone,
        password: this.formData.password,
        activeArea: this.formData.activeArea,
        bio: this.formData.bio,
        experienceYears: this.formData.experienceYears || 0,
        hourlyRate: this.formData.hourlyRate || 0
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
    this.formData = {
      fullName: '', email: '', password: '', phone: '',
      activeArea: helper.activeArea,
      bio: helper.bio || '',
      experienceYears: helper.experienceYears || 0,
      hourlyRate: helper.hourlyRate || 0
    };
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
