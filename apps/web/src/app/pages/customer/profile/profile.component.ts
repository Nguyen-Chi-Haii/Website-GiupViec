import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { AddressSelectorComponent, AddressResult } from '../../../shared/components/address-selector/address-selector.component';
import { environment } from '../../../../environments/environment';

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;  // API returns 'phone' not 'phoneNumber'
  address: string;
}

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressSelectorComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class CustomerProfileComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  isLoading = signal(true);
  isSaving = signal(false);
  profile = signal<UserProfile | null>(null);
  successMessage = signal('');
  errorMessage = signal('');
  
  // Touched state for real-time feedback
  touchedFields = signal<Set<string>>(new Set());
  isSubmitted = signal(false);

  formData = {
    fullName: signal(''),
    phoneNumber: signal('')
  };

  // Computed validation errors
  errors = computed(() => {
    const errors: Record<string, string> = {};
    const fullName = this.formData.fullName().trim();
    const phone = this.formData.phoneNumber().trim().replace(/\s/g, '');

    if (!fullName || fullName.length < 2) {
      errors['fullName'] = 'Họ tên phải có ít nhất 2 ký tự';
    }

    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phone || !phoneRegex.test(phone)) {
      errors['phone'] = 'Số điện thoại không hợp lệ (10 số)';
    }

    if (!this.currentFullAddress) {
      errors['address'] = 'Vui lòng chọn địa chỉ';
    }

    return errors;
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  getInitials(): string {
    const name = this.profile()?.fullName || this.profile()?.email || '';
    return name.charAt(0).toUpperCase();
  }

  onAddressChange(result: AddressResult): void {
    this.currentFullAddress = result.fullAddress;
    this.markTouched('address');
  }

  markTouched(field: string): void {
    if (!this.touchedFields().has(field)) {
      this.touchedFields.update(prev => new Set(prev).add(field));
    }
  }

  loadProfile(): void {
    const userId = this.authService.currentUser()?.nameid;
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.http.get<UserProfile>(`${environment.apiUrl}/users/${userId}`).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.formData.fullName.set(data.fullName || '');
        this.formData.phoneNumber.set(data.phone || '');
        this.currentFullAddress = data.address || '';
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  currentFullAddress = '';



  saveProfile(): void {
    const userId = this.authService.currentUser()?.nameid;
    if (!userId) return;

    this.isSubmitted.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    if (Object.keys(this.errors()).length > 0) {
      return;
    }

    this.isSaving.set(true);

    this.http.put(`${environment.apiUrl}/users/${userId}`, {
      fullName: this.formData.fullName(),
      phone: this.formData.phoneNumber(),
      address: this.currentFullAddress
    }).subscribe({
      next: () => {
        this.successMessage.set('Cập nhật hồ sơ thành công!');
        this.isSaving.set(false);
        this.loadProfile();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Có lỗi xảy ra');
        this.isSaving.set(false);
      }
    });
  }
}
