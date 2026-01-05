import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, HelperProfile } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AddressSelectorComponent, AddressResult } from '../../../shared/components/address-selector/address-selector.component';

@Component({
  selector: 'app-admin-helpers',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressSelectorComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Quản Lý Người Giúp Việc</h2>
        <div class="header-actions">
          <div class="search-box">
             <input type="text" [(ngModel)]="searchQuery" (input)="applyFilters()" placeholder="Tìm theo tên/email..." class="filter-input" />
          </div>
          <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="filter-select">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Khóa (Soft Delete)</option>
          </select>
          <button class="btn-primary" (click)="openCreateModal()">
            <span class="material-symbols-outlined">person_add</span>
            Thêm Helper
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
                  <th>Khu vực</th>
                   <th>Kinh nghiệm</th>
                  <th>Đánh giá</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                @for (helper of filteredHelpers(); track helper.id) {
                  <tr>
                    <td class="font-medium">#{{ helper.id }}</td>
                    <td>
                      <div class="user-cell">
                        <div class="user-avatar">{{ getInitials(helper.fullName) }}</div>
                        <span>{{ helper.fullName }}</span>
                      </div>
                    </td>
                    <td class="text-muted">{{ helper.email }}</td>
                     <td class="text-muted">{{ helper.activeArea }}</td>
                    <td>{{ helper.experienceYears }} năm</td>
                    <td>
                       <span class="rating">⭐ {{ helper.ratingAverage | number:'1.1-1' }}</span>
                    </td>
                    <td>
                      <span class="status-badge" [class]="getStatusClass(helper.status)">
                        {{ getStatusLabel(helper.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                      <button class="icon-btn edit-btn" title="Sửa" (click)="openEditModal(helper)">
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button class="icon-btn" [title]="isHelperActive(helper.status) ? 'Khóa' : 'Mở khóa'" (click)="toggleStatus(helper)">
                        <span class="material-symbols-outlined">{{ isHelperActive(helper.status) ? 'lock' : 'lock_open' }}</span>
                      </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="empty-state">Không có người giúp việc nào</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>

      <!-- Create Helper Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ isEditMode() ? 'Sửa Người Giúp Việc' : 'Thêm Người Giúp Việc Mới' }}</h3>
              <button class="close-btn" (click)="closeModal()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="modal-body">
              @if (!isEditMode()) {
                <p class="subtitle">Lưu ý: Hệ thống sẽ tạo đồng thời tài khoản Người dùng và Hồ sơ Helper.</p>
              } @else {
                <p class="subtitle">Chỉnh sửa thông tin hồ sơ Helper. Thông tin tài khoản (tên, email) không thể sửa.</p>
              }
              <div class="form-grid">
                @if (!isEditMode()) {
                  <div class="form-group full-width">
                    <label>Họ và tên <span class="required">*</span></label>
                    <input type="text" [(ngModel)]="formData.fullName" placeholder="Nguyễn Văn A" />
                  </div>
                  <div class="form-group">
                    <label>Email <span class="required">*</span></label>
                    <input type="email" [(ngModel)]="formData.email" placeholder="helper@email.com" />
                  </div>
                  <div class="form-group">
                    <label>Mật khẩu <span class="required">*</span></label>
                    <input type="password" [(ngModel)]="formData.password" placeholder="Tối thiểu 6 ký tự" />
                  </div>
                  <div class="form-group">
                    <label>Số điện thoại</label>
                    <input type="tel" [(ngModel)]="formData.phone" placeholder="0912345678" />
                  </div>
                }
                <div class="form-group">
                  <label>Số năm kinh nghiệm <span class="required">*</span></label>
                  <input type="number" [(ngModel)]="formData.experienceYears" min="0" max="50" placeholder="0" />
                </div>
                <div class="form-group">
                  <label>Giá mỗi giờ (VNĐ)</label>
                  <input type="number" [(ngModel)]="formData.hourlyRate" min="0" placeholder="50000" />
                </div>
                <div class="form-group full-width">
                  <label>Khu vực hoạt động <span class="required">*</span></label>
                  <app-address-selector 
                    [initialAddress]="formData.activeArea"
                    (addressChange)="onAddressChange($event)"
                  ></app-address-selector>
                </div>
                <div class="form-group full-width">
                  <label>Giới thiệu (Bio)</label>
                  <textarea [(ngModel)]="formData.bio" rows="3" placeholder="Mô tả kinh nghiệm, kỹ năng..."></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-outline" (click)="closeModal()">Hủy</button>
              <button type="button" class="btn-submit" (click)="saveHelper()">{{ isEditMode() ? 'Cập nhật' : 'Tạo mới' }}</button>
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
    .filter-input { padding: 0.5rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; background: white; min-width: 200px; }
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
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.75rem; }
    .rating { color: #f59e0b; font-weight: 600; }
    .status-badge { display: inline-flex; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .status-badge.active { background: #dcfce7; color: #16a34a; }
    .status-badge.inactive { background: #fee2e2; color: #ef4444; }
    .action-buttons { display: flex; gap: 0.5rem; }
    .icon-btn { min-width: 36px; min-height: 36px; width: 36px; height: 36px; border: 1px solid #e5e7eb; background: #ffffff; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; color: #13b9a5; transition: all 0.2s; padding: 0; }
    .icon-btn:hover { background: #13b9a5; color: #ffffff; border-color: #13b9a5; }
    .icon-btn.delete-btn { color: #ef4444; }
    .icon-btn.delete-btn:hover { background: #ef4444; color: #ffffff; border-color: #ef4444; }
    .icon-btn .material-symbols-outlined { font-size: 20px !important; }
    .filter-select { padding: 0.5rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; background: white; cursor: pointer; }
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
    .form-group input, .form-group textarea { width: 100%; padding: 0.75rem 1rem; border: 1px solid #374151; border-radius: 8px; font-size: 0.9rem; background: #2d3a3a; color: #e5e7eb; }
    .form-group textarea { resize: none; }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #13b9a5; }
    .form-group input:disabled { background: #1f2937; cursor: not-allowed; color: #6b7280; }
    .subtitle { color: #9ca3af; font-size: 0.875rem; margin-bottom: 1.5rem; }
  `]
})
export class AdminHelpersComponent implements OnInit {
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

  ngOnInit(): void {
    this.loadHelpers();
  }

  loadHelpers(): void {
    this.adminService.getAllHelperProfiles().subscribe({
      next: (data) => {
        this.helpers.set(data);
        this.filteredHelpers.set(data);
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
  this.editingHelper.set(null); // Clear edit state
}

  onAddressChange(result: AddressResult): void {
    this.formData.activeArea = result.fullAddress;
  }

  saveHelper(): void {
  // Validation for required fields
  if (!this.formData.activeArea) {
    this.notification.warning('Vui lòng điền khu vực hoạt động!');
    return;
  }
  if (this.isEditMode()) {
    // UPDATE MODE
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
    // CREATE MODE
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
  editingHelper = signal<HelperProfile | null>(null);
isEditMode = computed(() => this.editingHelper() !== null);

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
    const newStatus = currentActive ? 2 : 1; // 1=Active, 2=Inactive
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

  getExperience(startDate: string): number {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    if (now.getMonth() < start.getMonth() || (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())) {
      years--;
    }
    return Math.max(0, years);
  }
}
