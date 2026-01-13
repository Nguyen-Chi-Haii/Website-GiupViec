import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { UserRole } from '@giupviec/shared';
import { AuthService } from '../../../core/services/auth.service';
import { AddressSelectorComponent, AddressResult } from '../../../shared/components/address-selector/address-selector.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AddressSelectorComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  
  // Form state
  // role = signal<UserRole>(UserRole.Customer); // Need to import UserRole or use string if enum not available in template easily without import
  role = signal<UserRole>(UserRole.Customer);
  fullName = signal('');
  email = signal('');
  phone = signal('');
  address = signal('');
  password = signal('');
  confirmPassword = signal('');
  agreeTerms = signal(false);
  
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  
  // Touched state for real-time feedback
  touchedFields = signal<Set<string>>(new Set());
  isSubmitted = signal(false);

  // Expose UserRole to template
  UserRole = UserRole;

  private readonly route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['role'] === 'Helper') {
        this.role.set(UserRole.Helper);
      }
    });
  }

  setRole(role: UserRole) {
    this.role.set(role);
    // Reset form errors when switching roles if needed, or keep them
  }

  // Computed validation errors
  errors = computed(() => {
    const errors: Record<string, string> = {};
    const fullName = this.fullName().trim();
    const email = this.email().trim();
    const phone = this.phone().trim().replace(/\s/g, '');
    const password = this.password();
    const confirmPassword = this.confirmPassword();
    const agreeTerms = this.agreeTerms();

    if (!fullName || fullName.length < 2) {
      errors['fullName'] = 'Họ tên phải có ít nhất 2 ký tự';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors['email'] = 'Email không hợp lệ';
    }

    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phone || !phoneRegex.test(phone)) {
      errors['phone'] = 'Số điện thoại phải có 10 số (VD: 0912345678)';
    }

    if (!password || password.length < 6) {
      errors['password'] = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (password !== confirmPassword) {
      errors['confirmPassword'] = 'Mật khẩu nhập lại không khớp';
    }

    if (!agreeTerms) {
      errors['terms'] = 'Bạn phải đồng ý với điều khoản sử dụng';
    }

    if (!this.address()) {
      errors['address'] = 'Vui lòng chọn địa chỉ';
    }

    return errors;
  });

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword.update(v => !v);
    } else {
      this.showConfirmPassword.update(v => !v);
    }
  }

  markTouched(field: string): void {
    if (!this.touchedFields().has(field)) {
      this.touchedFields.update(prev => new Set(prev).add(field));
    }
  }

  onAddressChange(result: AddressResult): void {
    this.address.set(result.fullAddress);
    this.markTouched('address');
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.isSubmitted.set(true);
    
    // Reset messages
    this.errorMessage.set(null);
    this.successMessage.set(null);
    
    if (Object.keys(this.errors()).length > 0) {
      return;
    }

    this.isLoading.set(true);

    // Call API to register
    this.authService.register({
      fullName: this.fullName(),
      email: this.email(),
      phone: this.phone(),
      address: this.address() || undefined,
      password: this.password(),
      role: this.role(),
      status: 1 // Active
    }).subscribe({
      next: () => {
        // Success - show message and navigate to login
        this.successMessage.set('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
        this.isLoading.set(false);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        // Handle error
        if (error.error?.message) {
          this.errorMessage.set(error.error.message);
        } else {
          this.errorMessage.set('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        }
        this.isLoading.set(false);
      }
    });
  }
}
