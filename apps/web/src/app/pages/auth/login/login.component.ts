import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Form state
  email = signal('');
  password = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    // Reset error
    this.errorMessage.set(null);
    
    // Basic validation
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email())) {
      this.errorMessage.set('Email không hợp lệ.');
      return;
    }

    this.isLoading.set(true);

    // Call API to login
    this.authService.login({
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: () => {
        // Success - navigate based on user role
        const redirectPath = this.authService.getRedirectPath();
        this.router.navigate([redirectPath]);
        this.isLoading.set(false);
      },
      error: (error) => {
        // Handle error
        if (error.status === 401) {
          this.errorMessage.set('Sai email hoặc mật khẩu. Vui lòng thử lại.');
        } else if (error.error?.message) {
          this.errorMessage.set(error.error.message);
        } else {
          this.errorMessage.set('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        }
        this.isLoading.set(false);
      }
    });
  }

  loginWithGoogle(): void {
    // TODO: Implement Google OAuth
    console.log('Login with Google');
  }

  loginWithFacebook(): void {
    // TODO: Implement Facebook OAuth
    console.log('Login with Facebook');
  }
}
