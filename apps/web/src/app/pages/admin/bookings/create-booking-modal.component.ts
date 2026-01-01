import { Component, EventEmitter, Output, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserResponse, ServiceResponse, BookingCreate, UserCreate } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { VietnamProvincesService } from '../../../core/services/vietnam-provinces.service';
import { ProvinceResponse, WardResponse } from '../../../core/types/vietnam-provinces.types';
import { SearchableDropdownComponent, DropdownOption } from '../../../shared/components/searchable-dropdown/searchable-dropdown.component';

interface AvailableHelper {
  id: number;
  fullName: string;
}

@Component({
  selector: 'app-create-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchableDropdownComponent],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Tạo Đơn Hàng Mới</h3>
          <button class="close-btn" (click)="close()">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="modal-body">
          <!-- Section 1: Khách hàng -->
          <div class="form-section">
            <h4>1. Thông tin khách hàng</h4>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="isNewCustomer" (change)="onCustomerTypeChange()">
                <span>Khách hàng mới</span>
              </label>
            </div>

            @if (!isNewCustomer) {
              <div class="form-group">
                <label>Chọn khách hàng *</label>
                <select [(ngModel)]="formData.customerId" class="form-select">
                  <option [value]="0">-- Chọn khách hàng --</option>
                  @for (customer of customers(); track customer.id) {
                    <option [value]="customer.id">{{ customer.fullName }} ({{ customer.email }})</option>
                  }
                </select>
              </div>
            } @else {
              <div class="form-row">
                <div class="form-group">
                  <label>Họ tên *</label>
                  <input type="text" [(ngModel)]="newCustomer.fullName" placeholder="Nguyễn Văn A">
                </div>
                <div class="form-group">
                  <label>Email *</label>
                  <input type="email" [(ngModel)]="newCustomer.email" placeholder="email@example.com">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Số điện thoại</label>
                  <input type="text" [(ngModel)]="newCustomer.phone" placeholder="0901234567">
                </div>
                <div class="form-group">
                  <label>Mật khẩu mặc định</label>
                  <input type="text" [value]="defaultPassword" readonly class="readonly-input">
                </div>
              </div>
            }
          </div>

          <!-- Section 2: Dịch vụ -->
          <div class="form-section">
            <h4>2. Chọn dịch vụ</h4>
            <div class="form-group">
              <label>Dịch vụ *</label>
              <select [(ngModel)]="formData.serviceId" class="form-select">
                <option [value]="0">-- Chọn dịch vụ --</option>
                @for (service of services(); track service.id) {
                  <option [value]="service.id">{{ service.name }} ({{ service.price | number }}₫/giờ)</option>
                }
              </select>
            </div>
          </div>

          <!-- Section 3: Lịch làm việc -->
          <div class="form-section">
            <h4>3. Lịch làm việc</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Ngày bắt đầu *</label>
                <input type="date" [(ngModel)]="formData.startDate" [min]="minDate">
              </div>
              <div class="form-group">
                <label>Ngày kết thúc *</label>
                <input type="date" [(ngModel)]="formData.endDate" [min]="formData.startDate || minDate">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Giờ bắt đầu *</label>
                <select [(ngModel)]="formData.workShiftStart" class="form-select">
                  @for (time of timeOptions; track time) {
                    <option [value]="time">{{ time }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>Giờ kết thúc *</label>
                <select [(ngModel)]="formData.workShiftEnd" class="form-select">
                  @for (time of timeOptions; track time) {
                    <option [value]="time">{{ time }}</option>
                  }
                </select>
              </div>
            </div>
          </div>

          <!-- Section 4: Địa chỉ -->
          <div class="form-section">
            <h4>4. Địa chỉ làm việc</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Tỉnh/Thành *</label>
                <app-searchable-dropdown
                  [options]="provinceOptions()"
                  [placeholder]="isLoadingProvinces() ? 'Đang tải...' : 'Chọn tỉnh/thành'"
                  [selectedCode]="selectedProvinceCode"
                  (selectionChange)="onProvinceSelect($event)">
                </app-searchable-dropdown>
              </div>
              <div class="form-group">
                <label>Phường/Xã *</label>
                <app-searchable-dropdown
                  [options]="wardOptions()"
                  [placeholder]="isLoadingWards() ? 'Đang tải...' : 'Chọn phường/xã'"
                  [selectedCode]="selectedWardCode"
                  (selectionChange)="onWardSelect($event)">
                </app-searchable-dropdown>
              </div>
            </div>
            <div class="form-group">
              <label>Địa chỉ chi tiết *</label>
              <input type="text" [(ngModel)]="streetAddress" placeholder="Số nhà, tên đường...">
            </div>
          </div>

          <!-- Section 5: Gán Helper (sau khi có đủ lịch) -->
          @if (canSelectHelper()) {
            <div class="form-section">
              <h4>5. Gán người giúp việc (tùy chọn)</h4>
              <div class="form-group">
                <label>Chọn người giúp việc</label>
                <select [(ngModel)]="formData.helperId" class="form-select">
                  <option [value]="0">-- Không gán ngay --</option>
                  @for (helper of availableHelpers(); track helper.id) {
                    <option [value]="helper.id">{{ helper.fullName }}</option>
                  }
                </select>
              </div>
            </div>
          }

          <!-- Section 6: Ghi chú -->
          <div class="form-section">
            <h4>{{ canSelectHelper() ? '6' : '5' }}. Ghi chú</h4>
            <div class="form-group">
              <textarea [(ngModel)]="formData.notes" placeholder="Ghi chú thêm..." rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-outline" (click)="close()">Hủy</button>
          <button class="btn-primary" (click)="submit()" [disabled]="isSubmitting()">
            @if (isSubmitting()) {
              <span>Đang xử lý...</span>
            } @else {
              <span class="material-symbols-outlined">add</span>
              Tạo đơn hàng
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 16px; width: 90%; max-width: 700px; max-height: 90vh; overflow: auto; }
    .modal.large { max-width: 800px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; background: white; z-index: 1; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; }
    .close-btn { background: none; border: none; cursor: pointer; color: #638884; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.5rem; border-top: 1px solid #e5e7eb; position: sticky; bottom: 0; background: white; }
    
    .form-section { margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .form-section:last-of-type { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .form-section h4 { margin: 0 0 1rem; font-size: 0.95rem; font-weight: 600; color: #13b9a5; }
    
    .form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .form-group { margin-bottom: 0.75rem; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; color: #111817; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; font-family: inherit; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #13b9a5; }
    .form-group textarea { resize: vertical; }
    
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .checkbox-label input[type="checkbox"] { width: 18px; height: 18px; accent-color: #13b9a5; }
    
    .readonly-input { background: #f3f4f6; color: #6b7280; cursor: not-allowed; }
    
    .form-select { width: 100%; padding: 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; }
    
    .btn-primary { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: #13b9a5; color: white; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { background: #0f9685; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-outline { padding: 0.75rem 1.25rem; background: transparent; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; }
  `]
})
export class CreateBookingModalComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private readonly adminService = inject(AdminService);
  private readonly notification = inject(NotificationService);
  private readonly provincesService = inject(VietnamProvincesService);

  // Data
  customers = signal<UserResponse[]>([]);
  services = signal<ServiceResponse[]>([]);
  availableHelpers = signal<AvailableHelper[]>([]);
  provinces = signal<ProvinceResponse[]>([]);
  wards = signal<WardResponse[]>([]);

  // Loading states
  isLoadingProvinces = signal(false);
  isLoadingWards = signal(false);
  isSubmitting = signal(false);

  // Form state
  isNewCustomer = false;
  defaultPassword = 'Giupviec@123';
  
  newCustomer = {
    fullName: '',
    email: '',
    phone: ''
  };

  formData = {
    customerId: 0,
    serviceId: 0,
    startDate: '',
    endDate: '',
    workShiftStart: '08:00',
    workShiftEnd: '12:00',
    notes: '',
    helperId: 0
  };

  // Address
  selectedProvinceCode = '';
  selectedWardCode = '';
  streetAddress = '';

  // Time options
  timeOptions: string[] = [];

  // Computed
  provinceOptions = computed<DropdownOption[]>(() => 
    this.provinces().map(p => ({ code: p.code, name: p.name }))
  );

  wardOptions = computed<DropdownOption[]>(() => 
    this.wards().map(w => ({ code: w.code, name: w.name }))
  );

  canSelectHelper = computed(() => {
    return this.formData.startDate && this.formData.endDate && 
           this.formData.workShiftStart && this.formData.workShiftEnd;
  });

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.generateTimeOptions();
    this.loadData();
    
    // Set default dates
    this.formData.startDate = this.minDate;
    this.formData.endDate = this.minDate;
  }

  private generateTimeOptions(): void {
    for (let h = 6; h <= 22; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        this.timeOptions.push(`${hour}:${minute}`);
      }
    }
  }

  private loadData(): void {
    // Load customers (role = Customer = 4)
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.customers.set(users.filter(u => 
          String(u.role) === '4' || String(u.role) === 'Customer'
        ));
        // Also get helpers
        this.availableHelpers.set(
          users.filter(u => String(u.role) === '3' || String(u.role) === 'Helper')
            .map(h => ({ id: h.id, fullName: h.fullName }))
        );
      }
    });

    // Load services
    this.adminService.getAllServices().subscribe({
      next: (services) => this.services.set(services.filter(s => s.isActive))
    });

    // Load provinces
    this.isLoadingProvinces.set(true);
    this.provincesService.getProvinces().subscribe({
      next: (data) => {
        this.provinces.set(data);
        this.isLoadingProvinces.set(false);
      },
      error: () => this.isLoadingProvinces.set(false)
    });
  }

  onCustomerTypeChange(): void {
    if (this.isNewCustomer) {
      this.formData.customerId = 0;
    } else {
      this.newCustomer = { fullName: '', email: '', phone: '' };
    }
  }

  onProvinceSelect(option: DropdownOption | null): void {
    if (option) {
      this.selectedProvinceCode = String(option.code);
      this.loadWards();
    } else {
      this.selectedProvinceCode = '';
      this.wards.set([]);
      this.selectedWardCode = '';
    }
  }

  onWardSelect(option: DropdownOption | null): void {
    this.selectedWardCode = option ? String(option.code) : '';
  }

  private loadWards(): void {
    if (!this.selectedProvinceCode) return;
    
    this.isLoadingWards.set(true);
    this.selectedWardCode = '';
    this.provincesService.getWardsByProvince(Number(this.selectedProvinceCode)).subscribe({
      next: (data) => {
        this.wards.set(data);
        this.isLoadingWards.set(false);
      },
      error: () => this.isLoadingWards.set(false)
    });
  }

  private buildFullAddress(): string {
    const province = this.provinces().find(p => p.code === Number(this.selectedProvinceCode));
    const ward = this.wards().find(w => w.code === Number(this.selectedWardCode));
    
    if (province && ward && this.streetAddress) {
      return `${this.streetAddress.trim()}, ${ward.name}, ${province.name}`;
    }
    return this.streetAddress.trim();
  }

  async submit(): Promise<void> {
    // Validation
    if (this.isNewCustomer) {
      if (!this.newCustomer.fullName || !this.newCustomer.email) {
        this.notification.warning('Vui lòng nhập họ tên và email khách hàng!');
        return;
      }
    } else {
      if (!this.formData.customerId) {
        this.notification.warning('Vui lòng chọn khách hàng!');
        return;
      }
    }

    if (!this.formData.serviceId) {
      this.notification.warning('Vui lòng chọn dịch vụ!');
      return;
    }

    if (!this.formData.startDate || !this.formData.endDate) {
      this.notification.warning('Vui lòng chọn ngày làm việc!');
      return;
    }

    if (!this.selectedProvinceCode || !this.selectedWardCode || !this.streetAddress) {
      this.notification.warning('Vui lòng nhập đầy đủ địa chỉ!');
      return;
    }

    this.isSubmitting.set(true);

    try {
      let customerId = this.formData.customerId;

      // Nếu là khách mới, tạo user trước
      if (this.isNewCustomer) {
        const fullAddress = this.buildFullAddress();
        const userDto: UserCreate = {
          fullName: this.newCustomer.fullName,
          email: this.newCustomer.email,
          phone: this.newCustomer.phone || undefined,
          password: this.defaultPassword,
          avatar: '',
          address: fullAddress, // Địa chỉ đi vào user luôn
          role: 4, // Customer
          status: 1 // Active
        };

        // Tạo user mới
        const newUser = await this.adminService.createUser(userDto).toPromise();
        if (newUser) {
          customerId = newUser.id;
        } else {
          throw new Error('Không thể tạo khách hàng mới');
        }
      }

      // Tạo booking
      const bookingDto: BookingCreate = {
        customerId: customerId,
        serviceId: this.formData.serviceId,
        startDate: this.formData.startDate,
        endDate: this.formData.endDate,
        workShiftStart: `${this.formData.workShiftStart}:00`,
        workShiftEnd: `${this.formData.workShiftEnd}:00`,
        address: this.buildFullAddress(),
        notes: this.formData.notes || undefined,
        helperId: this.formData.helperId > 0 ? this.formData.helperId : undefined
      };

      await this.adminService.createBooking(bookingDto).toPromise();

      this.notification.success('Tạo đơn hàng thành công!');
      this.created.emit();
      this.close();

    } catch (error: any) {
      console.error('Error creating booking:', error);
      this.notification.error('Lỗi: ' + (error.error?.message || error.message || 'Không thể tạo đơn hàng'));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  close(): void {
    this.closed.emit();
  }
}
