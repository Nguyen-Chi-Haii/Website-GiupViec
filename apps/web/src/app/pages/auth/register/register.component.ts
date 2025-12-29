import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserRole } from '@giupviec/shared';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  // Form state
  accountType = signal<'customer' | 'helper'>('customer');
  fullName = signal('');
  username = signal('');
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

  constructor(private router: Router) {}

  setAccountType(type: 'customer' | 'helper'): void {
    this.accountType.set(type);
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword.update(v => !v);
    } else {
      this.showConfirmPassword.update(v => !v);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    // Reset error
    this.errorMessage.set(null);
    
    // Validation
    if (!this.fullName() || !this.username() || !this.email() || !this.phone() || !this.password() || !this.confirmPassword()) {
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
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!phoneRegex.test(this.phone().replace(/\s/g, ''))) {
      this.errorMessage.set('Số điện thoại không hợp lệ.');
      return;
    }

    this.isLoading.set(true);

    // TODO: Integrate with AuthService
    const registerData = {
      fullName: this.fullName(),
      username: this.username(),
      email: this.email(),
      phone: this.phone(),
      address: this.address(),
      password: this.password(),
      role: this.accountType() === 'helper' ? UserRole.Helper : UserRole.Customer
    };

    console.log('Register data:', registerData);

    // Simulate API call
    setTimeout(() => {
      // Success - navigate to login
      this.router.navigate(['/login']);
      this.isLoading.set(false);
    }, 1500);
  }
}
