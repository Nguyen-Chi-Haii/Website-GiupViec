import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, ServiceResponse, ServiceCreate } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  
  // Touched state for real-time feedback
  touchedFields = signal<Set<string>>(new Set());
  isSubmitted = signal(false);

  formData = {
    name: signal(''),
    price: signal<number | null>(null)
  };

  // Computed validation errors
  errors = computed(() => {
    const errors: Record<string, string> = {};
    const name = this.formData.name().trim();
    const price = this.formData.price();

    if (!name || name.length < 3) {
      errors['name'] = 'Tên dịch vụ phải có ít nhất 3 ký tự';
    }

    if (price === null || price === undefined || price <= 0) {
      errors['price'] = 'Giá phải lớn hơn 0';
    }

    return errors;
  });

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.adminService.getAllServices().subscribe({
      next: (data) => {
        this.services.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.formData.name.set('');
    this.formData.price.set(null);
    this.isEditing.set(false);
    this.showModal.set(true);
    this.touchedFields.set(new Set());
    this.isSubmitted.set(false);
  }

  openEditModal(service: ServiceResponse): void {
    this.formData.name.set(service.name);
    this.formData.price.set(service.price);
    this.editingId = service.id;
    this.isEditing.set(true);
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

    const serviceData: ServiceCreate = {
      name: this.formData.name(),
      price: this.formData.price() || 0
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
        name: service.name,
        price: service.price,
        isActive: !service.isActive
      }).subscribe({
        next: () => {
          this.notification.success(`Đã ${statusText} dịch vụ thành công!`);
          this.loadServices();
        },
        error: (err) => this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể cập nhật'))
      });
    }
  }
}
