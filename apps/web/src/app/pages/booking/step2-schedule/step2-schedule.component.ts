import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BookingStateService, BookingSchedule, BookingAddress, GuestInfo } from '../../../core/services/booking-state.service';
import { VietnamProvincesService } from '../../../core/services/vietnam-provinces.service';
import { ProvinceResponse, WardResponse } from '../../../core/types/vietnam-provinces.types';
import { AddressSelectorComponent, AddressResult } from '../../../shared/components/address-selector/address-selector.component';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-booking-step2',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressSelectorComponent],
  templateUrl: './step2-schedule.component.html',
  styleUrl: './step2-schedule.component.css'
})
export class BookingStep2Component implements OnInit {
  private readonly bookingState = inject(BookingStateService);
  private readonly provincesService = inject(VietnamProvincesService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);

  // Form data
  startDate = '';
  endDate = '';
  workShiftStart = '08:00';
  workShiftEnd = '12:00';
  selectedProvinceCode = '';
  selectedWardCode = '';
  streetAddress = '';
  notes = '';

  // Guest info (for non-logged-in users)
  guestFullName = '';
  guestEmail = '';
  guestPhone = '';

  // Dropdown data from API v2 (2-tier: Province → Ward)
  provinces = signal<ProvinceResponse[]>([]);
  wards = signal<WardResponse[]>([]);

  // Loading states
  isLoadingProvinces = signal(false);
  isLoadingWards = signal(false);

  // Validation
  errors = signal<Record<string, string>>({});

  // Time options
  timeOptions: string[] = [];

  // Computed dropdown options - REMOVED since we use AddressSelectorComponent


  ngOnInit(): void {
    this.bookingState.setCurrentStep(2);
    
    // Check if step 1 completed
    if (!this.bookingState.canProceedToStep2()) {
      this.router.navigate(['/booking/step1']);
      return;
    }

    // Generate time options (06:00 - 22:00)
    this.generateTimeOptions();

    // Set default date to today
    const today = new Date();
    this.startDate = this.formatDate(today);
    this.endDate = this.formatDate(today);

    // Load provinces from API v2, then restore data
    this.loadProvinces();
  }

  private loadProvinces(): void {
    this.isLoadingProvinces.set(true);
    this.provincesService.getProvinces().subscribe({
      next: (data) => {
        this.provinces.set(data);
        this.isLoadingProvinces.set(false);
        this.restoreData();
      },
      error: () => {
        this.isLoadingProvinces.set(false);
        this.restoreData();
      }
    });
  }

  private generateTimeOptions(): void {
    for (let h = 8; h <= 22; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        this.timeOptions.push(`${hour}:${minute}`);
      }
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private restoreData(): void {
    const schedule = this.bookingState.schedule();
    const address = this.bookingState.address();
    const notes = this.bookingState.notes();

    if (schedule) {
      this.startDate = schedule.startDate;
      this.endDate = schedule.endDate;
      this.workShiftStart = schedule.workShiftStart.substring(0, 5);
      this.workShiftEnd = schedule.workShiftEnd.substring(0, 5);
    }

    if (address) {
      this.currentAddressResult = address;
      this.streetAddress = address.streetAddress;
    } else if (this.authService.isAuthenticated()) {
      this.loadUserAddress();
    }

    if (notes) {
      this.notes = notes;
    }
  }

  private loadUserAddress(): void {
    const userId = this.authService.currentUser()?.nameid;
    console.log('[Auto-fill] User ID:', userId, 'isAuthenticated:', this.authService.isAuthenticated());
    if (!userId) return;

    // Fetch user profile to get address
    this.http.get<{ address?: string }>(`${environment.apiUrl}/users/${userId}`).subscribe({
      next: (user) => {
        console.log('[Auto-fill] User data:', user);
        if (user.address && !this.streetAddress) {
          console.log('[Auto-fill] Parsing address:', user.address);
          this.parseUserAddress(user.address);
        }
      },
      error: (err) => {
        console.error('[Auto-fill] Error loading user:', err);
      }
    });
  }

  private parseUserAddress(address: string): void {
    if (!address) return;
    this.initialAddressFromUser = address;
  }

  currentAddressResult: any = null;
  initialAddressFromUser = '';

  onAddressChange(result: AddressResult): void {
    this.currentAddressResult = result;
    this.selectedProvinceCode = result.provinceCode;
    this.selectedWardCode = result.wardCode;
    this.streetAddress = result.streetAddress;
  }




  get selectedService() {
    return this.bookingState.selectedService();
  }

  get minDate(): string {
    return this.formatDate(new Date());
  }

  validate(): boolean {
    const errors: Record<string, string> = {};

    if (!this.startDate) {
      errors['startDate'] = 'Vui lòng chọn ngày bắt đầu';
    }

    if (!this.endDate) {
      errors['endDate'] = 'Vui lòng chọn ngày kết thúc';
    }

    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      errors['endDate'] = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    if (!this.workShiftStart) {
      errors['workShiftStart'] = 'Vui lòng chọn giờ bắt đầu';
    }

    if (!this.workShiftEnd) {
      errors['workShiftEnd'] = 'Vui lòng chọn giờ kết thúc';
    }

    if (this.workShiftStart && this.workShiftEnd && this.workShiftStart >= this.workShiftEnd) {
      errors['workShiftEnd'] = 'Giờ kết thúc phải sau giờ bắt đầu';
    }

    if (!this.selectedProvinceCode) {
      errors['province'] = 'Vui lòng chọn tỉnh/thành';
    }

    if (!this.selectedWardCode) {
      errors['ward'] = 'Vui lòng chọn phường/xã';
    }

    if (!this.streetAddress || this.streetAddress.trim().length < 5) {
      errors['streetAddress'] = 'Vui lòng nhập địa chỉ chi tiết (tối thiểu 5 ký tự)';
    }

    // Validate guest info if user is not logged in
    if (!this.authService.isAuthenticated()) {
      if (!this.guestFullName || this.guestFullName.trim().length < 2) {
        errors['guestFullName'] = 'Vui lòng nhập họ tên (tối thiểu 2 ký tự)';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.guestEmail || !emailRegex.test(this.guestEmail)) {
        errors['guestEmail'] = 'Vui lòng nhập email hợp lệ';
      }

      const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
      if (!this.guestPhone || !phoneRegex.test(this.guestPhone.replace(/\s/g, ''))) {
        errors['guestPhone'] = 'Vui lòng nhập số điện thoại hợp lệ';
      }
    }

    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }

  onBack(): void {
    this.saveData();
    this.router.navigate(['/booking/step1']);
  }

  onNext(): void {
    if (!this.validate()) return;

    this.saveData();
    this.router.navigate(['/booking/step3']);
  }

  private saveData(): void {
    const schedule: BookingSchedule = {
      startDate: this.startDate,
      endDate: this.endDate,
      workShiftStart: `${this.workShiftStart}:00`,
      workShiftEnd: `${this.workShiftEnd}:00`
    };
    this.bookingState.setSchedule(schedule);

    if (this.currentAddressResult) {
      const address: BookingAddress = {
        provinceCode: this.currentAddressResult.provinceCode,
        provinceName: this.currentAddressResult.provinceName,
        wardCode: this.currentAddressResult.wardCode,
        wardName: this.currentAddressResult.wardName,
        streetAddress: this.currentAddressResult.streetAddress,
        fullAddress: this.currentAddressResult.fullAddress
      };
      this.bookingState.setAddress(address);
    }

    this.bookingState.setNotes(this.notes.trim());

    // Save guest info if user is not logged in
    if (!this.authService.isAuthenticated() && this.guestFullName && this.guestEmail) {
      const guestInfo: GuestInfo = {
        fullName: this.guestFullName.trim(),
        email: this.guestEmail.trim(),
        phone: this.guestPhone.trim()
      };
      this.bookingState.setGuestInfo(guestInfo);
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }
}
