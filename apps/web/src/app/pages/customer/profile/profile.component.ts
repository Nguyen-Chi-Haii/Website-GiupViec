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
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Hồ Sơ Cá Nhân</h2>
      </div>

      @if (isLoading()) {
        <div class="loading">Đang tải...</div>
      } @else {
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar">{{ getInitials() }}</div>
            <div class="info">
              <h3>{{ profile()?.fullName || 'Chưa cập nhật' }}</h3>
              <p>{{ profile()?.email }}</p>
            </div>
          </div>

          <form (ngSubmit)="saveProfile()">
            <div class="form-grid">
              <div class="form-group">
                <label>Họ và tên</label>
                <input 
                  type="text" 
                  [value]="formData.fullName()" 
                  (input)="formData.fullName.set($any($event.target).value); markTouched('fullName')"
                  (blur)="markTouched('fullName')"
                  placeholder="Nguyễn Văn A" 
                  [class.error]="(touchedFields().has('fullName') || isSubmitted()) && errors()['fullName']" 
                />
                @if ((touchedFields().has('fullName') || isSubmitted()) && errors()['fullName']) {
                  <span class="error-text">{{ errors()['fullName'] }}</span>
                }
              </div>
              <div class="form-group">
                <label>Số điện thoại</label>
                <input 
                  type="tel" 
                  [value]="formData.phoneNumber()" 
                  (input)="formData.phoneNumber.set($any($event.target).value); markTouched('phone')"
                  (blur)="markTouched('phone')"
                  placeholder="0912345678" 
                  [class.error]="(touchedFields().has('phone') || isSubmitted()) && errors()['phone']" 
                />
                @if ((touchedFields().has('phone') || isSubmitted()) && errors()['phone']) {
                  <span class="error-text">{{ errors()['phone'] }}</span>
                }
              </div>
              
              <!-- Address Selector -->
              <div class="form-group full-width">
                <app-address-selector 
                  [initialAddress]="profile()?.address || ''"
                  (addressChange)="onAddressChange($event)"
                ></app-address-selector>
                @if ((touchedFields().has('address') || isSubmitted()) && errors()['address']) {
                  <span class="error-text">{{ errors()['address'] }}</span>
                }
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="isSaving()">
                @if (isSaving()) {
                  Đang lưu...
                } @else {
                  Lưu Thay Đổi
                }
              </button>
            </div>
          </form>

          @if (successMessage()) {
            <div class="success-message">{{ successMessage() }}</div>
          }
          @if (errorMessage()) {
            <div class="error-message">{{ errorMessage() }}</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; max-width: 600px; }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
    .loading { padding: 3rem; text-align: center; color: #638884; }
    .profile-card { background: white; border-radius: 12px; padding: 1.5rem; border: 1px solid #e5e7eb; }
    .profile-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: 700; }
    .info h3 { margin: 0; font-size: 1.1rem; }
    .info p { margin: 0.25rem 0 0; color: #638884; font-size: 0.9rem; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .form-group { display: flex; flex-direction: column; }
    .form-group.full-width { grid-column: span 2; }
    .form-group label { font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; color: #111817; }
    .form-group input, .form-group select { padding: 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; background: white; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #13b9a5; }
    .form-group input.error { border-color: #ef4444; }
    .error-text { color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; }
    .form-group select:disabled { background: #f3f4f6; cursor: not-allowed; }
    .form-actions { margin-top: 1.5rem; }
    .btn-primary { padding: 0.75rem 1.5rem; background: #13b9a5; color: white; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { background: #0f9685; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .success-message { margin-top: 1rem; padding: 0.75rem; background: #dcfce7; color: #16a34a; border-radius: 8px; }
    .error-message { margin-top: 1rem; padding: 0.75rem; background: #fef2f2; color: #dc2626; border-radius: 8px; }
    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
      .form-group.full-width { grid-column: span 1; }
    }
  `]
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
