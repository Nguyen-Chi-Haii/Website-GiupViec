import { Component, EventEmitter, Output, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserResponse, ServiceResponse, BookingCreate, UserCreate } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { HelperService } from '../../../core/services/helper.service';
import { AddressSelectorComponent, AddressResult } from '../../../shared/components/address-selector/address-selector.component';

interface AvailableHelper {
  id: number;
  fullName: string;
}

@Component({
  selector: 'app-create-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressSelectorComponent],
  templateUrl: './create-booking-modal.component.html',
  styleUrl: './create-booking-modal.component.css'
})
export class CreateBookingModalComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private readonly adminService = inject(AdminService);
  private readonly notification = inject(NotificationService);
  private readonly helperService = inject(HelperService);

  // Data
  customers = signal<UserResponse[]>([]);
  services = signal<ServiceResponse[]>([]);
  availableHelpers = signal<AvailableHelper[]>([]);

  // Loading states
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
    helperId: 0,
    address: '' // Stores the full address string for submission
  };

  // Address State
  currentAddressForSelector = ''; // Passed to app-address-selector [initialAddress]
  addressResult: AddressResult | null = null; // Captured from (addressChange)

  // Time options
  timeOptions: string[] = [];

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
    this.adminService.getAllUsers(1, 200).subscribe({
      next: (result) => {
        this.customers.set(result.items.filter(u => 
          String(u.role) === '4' || String(u.role) === 'Customer'
        ));
        // Also get helpers (fallback)
        this.availableHelpers.set(
          result.items.filter(u => String(u.role) === '3' || String(u.role) === 'Helper')
            .map(h => ({ id: h.id, fullName: h.fullName }))
        );
      }
    });

    // Load services
    this.adminService.getAllServices(1, 50).subscribe({
      next: (result) => this.services.set(result.items.filter(s => s.isActive))
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

  onCustomerChange(): void {
    const customerId = Number(this.formData.customerId);
    if (!customerId) {
        this.currentAddressForSelector = '';
        return;
    }

    const customer = this.customers().find(u => u.id === customerId);
    if (customer?.address) {
       this.currentAddressForSelector = customer.address;
       // We DON'T set formData.address here immediately, because the selector will parse and emit 'addressChange'
       // automatically if it matches? 
       // Actually AddressSelector usually emits on initial parsing too? 
       // Let's verify AddressSelector logic: "this.emitChange();" is called in "parseInitialAddress()". 
       // So yes, setting currentAddressForSelector will trigger parsing -> emit -> onAddressChange updates form data.
    } else {
        this.currentAddressForSelector = '';
    }
  }

  onCustomerTypeChange(): void {
    if (this.isNewCustomer) {
      this.formData.customerId = 0;
      this.currentAddressForSelector = '';
      this.addressResult = null;
      this.formData.address = '';
    } else {
      this.newCustomer = { fullName: '', email: '', phone: '' };
    }
  }

  onAddressChange(result: AddressResult): void {
    this.addressResult = result;
    this.formData.address = result.fullAddress;
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

    // Validate mandatory notes
    const selectedService = this.services().find(s => s.id === Number(this.formData.serviceId));
    if (selectedService?.requiresNotes && !this.formData.notes?.trim()) {
      this.notification.warning(`Dịch vụ này yêu cầu nhập ghi chú (${selectedService.notePrompt || 'Bắt buộc'})!`);
      return;
    }

    if (!this.formData.startDate || !this.formData.endDate) {
      this.notification.warning('Vui lòng chọn ngày làm việc!');
      return;
    }

    if (!this.formData.address) {
      this.notification.warning('Vui lòng nhập đầy đủ địa chỉ!');
      return;
    }

    this.isSubmitting.set(true);

    try {
      let customerId = this.formData.customerId;

      // Nếu là khách mới, tạo user trước
      if (this.isNewCustomer) {
        const fullAddress = this.formData.address;
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
        address: this.formData.address,
        notes: this.formData.notes || undefined,
        helperId: this.formData.helperId > 0 ? this.formData.helperId : undefined,
        quantity: 1
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
