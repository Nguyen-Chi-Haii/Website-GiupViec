import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ServiceResponse, ServiceCreateDTO, ServiceUpdateDTO, ServiceUnit } from '@giupviec/shared';
import { NotificationService } from '../../../core/services/notification.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class AdminServicesComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly notification = inject(NotificationService);

  services = signal<ServiceResponse[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  isEditing = signal(false);
  editingId = 0;
  
  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(1);
  totalItems = signal(0);
  
  // Touched state for real-time feedback
  touchedFields = signal<Set<string>>(new Set());
  isSubmitted = signal(false);

  formData = {
    name: signal(''),
    description: signal(''),
    price: signal<number | null>(null),
    unit: signal<ServiceUnit>('Hour'),
    unitLabel: signal(''),
    minQuantity: signal(1),
    requiresNotes: signal(false),
    notePrompt: signal(''),
    icon: signal('')
  };

  availableIcons = [
    'cleaning_services', 'ac_unit', 'local_laundry_service', 'restaurant', 
    'home_work', 'elderly', 'pest_control', 'plumbing', 
    'imagesearch_roller', 'yard', 'checkroom', 'kitchen'
  ];

  unitLabelsSuggestion = signal<string[]>([]);
  showCustomLabelInput = signal(false);

  // Computed validation errors
  errors = computed(() => {
    const errors: Record<string, string> = {};
    const name = this.formData.name().trim();
    const price = this.formData.price();
    const unit = this.formData.unit();

    if (!name || name.length < 3) {
      errors['name'] = 'Tên dịch vụ phải có ít nhất 3 ký tự';
    }

    if (price === null || price === undefined || price <= 0) {
      errors['price'] = 'Giá phải lớn hơn 0';
    }

    if (!unit) {
      errors['unit'] = 'Vui lòng chọn đơn vị tính';
    }

    return errors;
  });

  ngOnInit(): void {
    this.loadServices();
    this.loadUnitLabels();
  }

  loadServices(): void {
    this.adminService.getAllServices(this.currentPage(), this.pageSize()).subscribe({
      next: (result) => {
        this.services.set(result.items);
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

  loadUnitLabels(): void {
    this.adminService.getServiceUnitLabels().subscribe(labels => {
      // Ensure common labels are always available
      const commonLabels = ['giờ', 'máy', 'm2', 'buổi', 'lần', 'cái'];
      const mergedLabels = Array.from(new Set([...commonLabels, ...labels]));
      this.unitLabelsSuggestion.set(mergedLabels);
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadServices();
  }

  onUnitLabelSelect(value: string): void {
    if (value === '__CUSTOM__') {
      this.showCustomLabelInput.set(true);
      this.formData.unitLabel.set('');
    } else {
      this.showCustomLabelInput.set(false);
      this.formData.unitLabel.set(value);
    }
  }

  toggleCustomLabel(isCustom: boolean): void {
    this.showCustomLabelInput.set(isCustom);
    if (!isCustom && this.unitLabelsSuggestion().length > 0) {
      this.formData.unitLabel.set(this.unitLabelsSuggestion()[0]); // Default to first option
    }
  }

  openCreateModal(): void {
    this.formData.name.set('');
    this.formData.description.set('');
    this.formData.price.set(null);
    this.formData.unit.set('Hour');
    this.formData.unitLabel.set('giờ');
    this.formData.minQuantity.set(1);
    this.formData.requiresNotes.set(false);
    this.formData.notePrompt.set('');
    this.formData.icon.set('cleaning_services');
    
    this.isEditing.set(false);
    this.showCustomLabelInput.set(false);
    this.showModal.set(true);
    this.touchedFields.set(new Set());
    this.isSubmitted.set(false);
  }

  openEditModal(service: ServiceResponse): void {
    this.formData.name.set(service.name);
    this.formData.description.set(service.description || '');
    this.formData.price.set(service.price);
    this.formData.unit.set(service.unit);
    this.formData.unitLabel.set(service.unitLabel || '');
    this.formData.minQuantity.set(service.minQuantity);
    this.formData.requiresNotes.set(service.requiresNotes);
    this.formData.notePrompt.set(service.notePrompt || '');
    this.formData.icon.set(service.icon || '');

    this.editingId = service.id;
    this.isEditing.set(true);
    
    // If current label is not in suggestion list, set to Custom mode
    const currentLabel = service.unitLabel || '';
    const isKnownLabel = this.unitLabelsSuggestion().includes(currentLabel);
    this.showCustomLabelInput.set(!isKnownLabel && !!currentLabel);

    this.showModal.set(true);
    this.touchedFields.set(new Set());
    this.isSubmitted.set(false);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  markTouched(field: string): void {
    if (!this.touchedFields().has(field)) {
      this.touchedFields.update(prev => new Set(prev).add(field));
    }
  }

  saveService(): void {
    this.isSubmitted.set(true);
    if (Object.keys(this.errors()).length > 0) {
      return;
    }

    const serviceData: ServiceCreateDTO = {
      name: this.formData.name(),
      description: this.formData.description(),
      price: this.formData.price() || 0,
      unit: this.formData.unit(),
      unitLabel: this.formData.unitLabel(),
      minQuantity: this.formData.minQuantity(),
      requiresNotes: this.formData.requiresNotes(),
      notePrompt: this.formData.notePrompt(),
      icon: this.formData.icon(),
      isActive: true
    };

    if (this.isEditing()) {
      this.adminService.updateService(this.editingId, serviceData).subscribe({
        next: () => {
          this.notification.success('Cập nhật thành công!');
          this.closeModal();
          this.loadServices();
        },
        error: (err) => this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể cập nhật'))
      });
    } else {
      this.adminService.createService(serviceData).subscribe({
        next: () => {
          this.notification.success('Tạo dịch vụ thành công!');
          this.closeModal();
          this.loadServices();
        },
        error: (err) => this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể tạo'))
      });
    }
  }

  async toggleStatus(service: ServiceResponse): Promise<void> {
    const statusText = service.isActive ? 'tắt' : 'bật';
    const confirmed = await this.notification.confirm(`Bạn có chắc muốn ${statusText} dịch vụ "${service.name}"?`);
    if (confirmed) {
      this.adminService.updateService(service.id, {
        isActive: !service.isActive
      } as ServiceUpdateDTO).subscribe({
        next: () => {
          this.notification.success(`Đã ${statusText} dịch vụ thành công!`);
          this.loadServices();
        },
        error: (err) => this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể cập nhật'))
      });
    }
  }
}
