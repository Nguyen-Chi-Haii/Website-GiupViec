import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserRole } from '@giupviec/shared';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Form state
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
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword.update(v => !v);
    } else {
      this.showConfirmPassword.update(v => !v);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    // Reset messages
    this.errorMessage.set(null);
    this.successMessage.set(null);
    
    // Validation
    if (!this.fullName() || !this.email() || !this.phone() || !this.password() || !this.confirmPassword()) {
      this.errorMessage.set('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Mật khẩu nhập lại không khớp.');
      return;
    }

    if (this.password().length < 6) {
      this.errorMessage.set('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (!this.agreeTerms()) {
      this.errorMessage.set('Vui lòng đồng ý với điều khoản sử dụng.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email())) {
      this.errorMessage.set('Email không hợp lệ.');
      return;
    }

    // Phone validation
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(this.phone().replace(/\s/g, ''))) {
      this.errorMessage.set('Số điện thoại không hợp lệ.');
      return;
    }

    this.isLoading.set(true);

    // Call API to register (always as Customer)
    this.authService.register({
      fullName: this.fullName(),
      email: this.email(),
      phone: this.phone(),
      address: this.address() || undefined,
      password: this.password(),
      role: UserRole.Customer,
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
