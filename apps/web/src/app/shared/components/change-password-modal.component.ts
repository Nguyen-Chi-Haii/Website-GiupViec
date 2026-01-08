import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, ChangePasswordRequest } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password-modal.component.html',
  styleUrl: './change-password-modal.component.css'
})
export class ChangePasswordModalComponent {
  @Output() passwordChanged = new EventEmitter<void>();
  
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  
  isSubmitting = signal(false);
  errorMessage = signal('');
  
  onSubmit(): void {
    this.errorMessage.set('');
    
    // Validation
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage.set('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    if (this.newPassword.length < 6) {
      this.errorMessage.set('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Mật khẩu mới không khớp với xác nhận');
      return;
    }
    
    this.isSubmitting.set(true);
    
    const request: ChangePasswordRequest = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    };
    
    this.authService.changePassword(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notification.success('Đổi mật khẩu thành công!');
        this.passwordChanged.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Đổi mật khẩu thất bại');
      }
    });
  }
}
