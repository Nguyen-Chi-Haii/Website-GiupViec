import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingStateService, BookingSchedule, BookingAddress } from '../../../core/services/booking-state.service';
import { VietnamProvincesService } from '../../../core/services/vietnam-provinces.service';
import { ProvinceResponse, WardResponse } from '../../../core/types/vietnam-provinces.types';
import { SearchableDropdownComponent, DropdownOption } from '../../../shared/components/searchable-dropdown/searchable-dropdown.component';

@Component({
  selector: 'app-booking-step2',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchableDropdownComponent],
  templateUrl: './step2-schedule.component.html',
  styleUrl: './step2-schedule.component.css'
})
export class BookingStep2Component implements OnInit {
  private readonly bookingState = inject(BookingStateService);
  private readonly provincesService = inject(VietnamProvincesService);
  private readonly router = inject(Router);

  // Form data
  startDate = '';
  endDate = '';
  workShiftStart = '08:00';
  workShiftEnd = '12:00';
  selectedProvinceCode = '';
  selectedWardCode = '';
  streetAddress = '';
  notes = '';

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

  // Computed dropdown options for searchable dropdown
  provinceOptions = computed<DropdownOption[]>(() => 
    this.provinces().map(p => ({ code: p.code, name: p.name }))
  );

  wardOptions = computed<DropdownOption[]>(() => 
    this.wards().map(w => ({ code: w.code, name: w.name }))
  );

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

    // Load provinces from API v2 (34 provinces after 2025 reform)
    this.loadProvinces();

    // Restore previous data if exists
    this.restoreData();
  }

  private loadProvinces(): void {
    this.isLoadingProvinces.set(true);
    this.provincesService.getProvinces().subscribe({
      next: (data) => {
        this.provinces.set(data);
        this.isLoadingProvinces.set(false);
      },
      error: () => {
        this.isLoadingProvinces.set(false);
      }
    });
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
      this.selectedProvinceCode = address.provinceCode;
      if (this.selectedProvinceCode) {
        this.onProvinceChange().then(() => {
          this.selectedWardCode = address.wardCode;
        });
      }
      this.streetAddress = address.streetAddress;
    }

    if (notes) {
      this.notes = notes;
    }
  }

  onProvinceChange(): Promise<void> {
    return new Promise((resolve) => {
      this.wards.set([]);
      this.selectedWardCode = '';

      if (!this.selectedProvinceCode) {
        resolve();
        return;
      }

      this.isLoadingWards.set(true);
      this.provincesService.getWardsByProvince(Number(this.selectedProvinceCode)).subscribe({
        next: (data) => {
          this.wards.set(data);
          this.isLoadingWards.set(false);
          resolve();
        },
        error: () => {
          this.isLoadingWards.set(false);
          resolve();
        }
      });
    });
  }

  // Searchable dropdown handlers
  onProvinceSelect(option: DropdownOption | null): void {
    if (option) {
      this.selectedProvinceCode = String(option.code);
      this.onProvinceChange();
    } else {
      this.selectedProvinceCode = '';
      this.wards.set([]);
      this.selectedWardCode = '';
    }
  }

  onWardSelect(option: DropdownOption | null): void {
    if (option) {
      this.selectedWardCode = String(option.code);
    } else {
      this.selectedWardCode = '';
    }
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

    const selectedProvince = this.provinces().find(p => p.code === Number(this.selectedProvinceCode));
    const selectedWard = this.wards().find(w => w.code === Number(this.selectedWardCode));

    if (selectedProvince && selectedWard) {
      const address: BookingAddress = {
        provinceCode: this.selectedProvinceCode,
        provinceName: selectedProvince.name,
        wardCode: this.selectedWardCode,
        wardName: selectedWard.name,
        streetAddress: this.streetAddress.trim(),
        fullAddress: `${this.streetAddress.trim()}, ${selectedWard.name}, ${selectedProvince.name}`
      };
      this.bookingState.setAddress(address);
    }

    this.bookingState.setNotes(this.notes.trim());
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }
}
