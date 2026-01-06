import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChangePasswordModalComponent } from '../../../shared/components/change-password-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ChangePasswordModalComponent],
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
  
  // Touched state for real-time feedback
  touchedFields = signal<Set<string>>(new Set());
  isSubmitted = signal(false);

  // Computed validation errors
  errors = computed(() => {
    const errors: Record<string, string> = {};
    const email = this.email().trim();
    const password = this.password();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors['email'] = 'Email không hợp lệ';
    }

    if (!password) {
      errors['password'] = 'Vui lòng nhập mật khẩu';
    }

    return errors;
  });
  
  // Password change modal state
  showChangePasswordModal = signal(false);

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  markTouched(field: string): void {
    if (!this.touchedFields().has(field)) {
      this.touchedFields.update(prev => new Set(prev).add(field));
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.isSubmitted.set(true);
    
    // Reset error
    this.errorMessage.set(null);
    
    if (Object.keys(this.errors()).length > 0) {
      return;
    }

    this.isLoading.set(true);

    // Call API to login
    this.authService.login({
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        
        // Check if password change is required
        if (response.mustChangePassword) {
          this.showChangePasswordModal.set(true);
        } else {
          // Success - navigate based on user role
          const redirectPath = this.authService.getRedirectPath();
          this.router.navigate([redirectPath]);
        }
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

  onPasswordChanged(): void {
    // Password changed successfully, close modal and navigate
    this.showChangePasswordModal.set(false);
    const redirectPath = this.authService.getRedirectPath();
    this.router.navigate([redirectPath]);
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
