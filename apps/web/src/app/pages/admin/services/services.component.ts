import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, ServiceResponse, ServiceCreate } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Quản Lý Dịch Vụ</h2>
        <button class="btn-primary" (click)="openCreateModal()">
          <span class="material-symbols-outlined">add</span>
          Thêm Dịch Vụ
        </button>
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
                  <th>Tên dịch vụ</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                @for (service of services(); track service.id) {
                  <tr>
                    <td class="font-medium">#{{ service.id }}</td>
                    <td>{{ service.name }}</td>
                    <td class="font-medium">{{ service.price | number }}₫/giờ</td>
                    <td>
                      <span class="status-badge" [class.active]="service.isActive" [class.inactive]="!service.isActive">
                        {{ service.isActive ? 'Hoạt động' : 'Tạm dừng' }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="icon-btn" title="Sửa" (click)="openEditModal(service)">
                          <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="icon-btn" title="Đổi trạng thái" (click)="toggleStatus(service)">
                          <span class="material-symbols-outlined">
                            {{ service.isActive ? 'pause' : 'play_arrow' }}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="empty-state">Chưa có dịch vụ nào</td>
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
              <h3>{{ isEditing() ? 'Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới' }}</h3>
              <button class="close-btn" (click)="closeModal()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Tên dịch vụ</label>
                <input 
                  type="text" 
                  [value]="formData.name()" 
                  (input)="formData.name.set($any($event.target).value); markTouched('name')"
                  (blur)="markTouched('name')"
                  placeholder="VD: Dọn dẹp nhà cửa" 
                  [class.error]="(touchedFields().has('name') || isSubmitted()) && errors()['name']" 
                />
                @if ((touchedFields().has('name') || isSubmitted()) && errors()['name']) {
                  <span class="error-text">{{ errors()['name'] }}</span>
                }
              </div>
              <div class="form-group">
                <label>Giá (VNĐ/giờ)</label>
                <input 
                  type="number" 
                  [value]="formData.price()" 
                  (input)="formData.price.set($any($event.target).value ? +$any($event.target).value : null); markTouched('price')"
                  (blur)="markTouched('price')"
                  placeholder="VD: 50000" 
                  [class.error]="(touchedFields().has('price') || isSubmitted()) && errors()['price']" 
                />
                @if ((touchedFields().has('price') || isSubmitted()) && errors()['price']) {
                  <span class="error-text">{{ errors()['price'] }}</span>
                }
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-outline" (click)="closeModal()">Hủy</button>
              <button class="btn-primary" (click)="saveService()">
                {{ isEditing() ? 'Cập nhật' : 'Tạo mới' }}
              </button>
            </div>
          </div>
        </div>
      }
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

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: #13b9a5;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: #0f9685;
    }

    .btn-outline {
      padding: 0.75rem 1.25rem;
      background: transparent;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
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

    .status-badge {
      display: inline-flex;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.active { background: #dcfce7; color: #16a34a; }
    .status-badge.inactive { background: #f3f4f6; color: #6b7280; }

    .action-buttons { display: flex; gap: 0.5rem; }

    .icon-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: #f6f8f8;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #638884;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: #e5e7eb;
      color: #111817;
    }

    .icon-btn .material-symbols-outlined { font-size: 18px; }

    .loading, .empty-state {
      padding: 3rem;
      text-align: center;
      color: #638884;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 500px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #638884;
    }

    .modal-body { padding: 1.5rem; }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #111817;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.9rem;
    }

    .form-group input:focus {
      outline: none;
      border-color: #13b9a5;
    }

    .form-group input.error {
      border-color: #ef4444;
    }

    .error-text {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
      display: block;
    }
  `]
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
