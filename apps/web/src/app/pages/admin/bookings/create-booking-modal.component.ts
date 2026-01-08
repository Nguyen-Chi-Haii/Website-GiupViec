import { Component, EventEmitter, Output, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserResponse, ServiceResponse, BookingCreate, UserCreate } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { VietnamProvincesService } from '../../../core/services/vietnam-provinces.service';
import { HelperService } from '../../../core/services/helper.service';
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
  templateUrl: './create-booking-modal.component.html',
  styleUrl: './create-booking-modal.component.css'
})
export class CreateBookingModalComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private readonly adminService = inject(AdminService);
  private readonly notification = inject(NotificationService);
  private readonly provincesService = inject(VietnamProvincesService);
  private readonly helperService = inject(HelperService);

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
        // Also get helpers (fallback)
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

  onTimeChange(): void {
    if (this.canSelectHelper()) {
      this.fetchAvailableHelpers();
    }
  }

  private fetchAvailableHelpers(): void {
    this.helperService.getAvailableHelpers({
      serviceId: Number(this.formData.serviceId),
      startDate: this.formData.startDate,
      endDate: this.formData.endDate,
      workShiftStart: `${this.formData.workShiftStart}:00`,
      workShiftEnd: `${this.formData.workShiftEnd}:00`
    }).subscribe({
      next: (helpers) => {
        this.availableHelpers.set(helpers.map(h => ({
          id: h.userId,
          fullName: h.fullName
        })));
      },
      error: (err) => {
        console.error('Error fetching available helpers:', err);
      }
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
