import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, ChangePasswordRequest } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="icon-wrapper">
            <span class="material-symbols-outlined">lock_reset</span>
          </div>
          <h2>Đổi Mật Khẩu</h2>
          <p class="subtitle">Vui lòng đổi mật khẩu để tiếp tục sử dụng tài khoản</p>
        </div>
        
        <form class="modal-body" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="currentPassword">Mật khẩu hiện tại *</label>
            <input 
              type="password" 
              id="currentPassword"
              [(ngModel)]="currentPassword"
              name="currentPassword"
              placeholder="Nhập mật khẩu được cấp"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="newPassword">Mật khẩu mới *</label>
            <input 
              type="password" 
              id="newPassword"
              [(ngModel)]="newPassword"
              name="newPassword"
              placeholder="Tối thiểu 6 ký tự"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Xác nhận mật khẩu mới *</label>
            <input 
              type="password" 
              id="confirmPassword"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>
          
          @if (errorMessage()) {
            <div class="error-message">{{ errorMessage() }}</div>
          }
          
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="isSubmitting()"
          >
            @if (isSubmitting()) {
              <span class="loading">Đang xử lý...</span>
            } @else {
              <span class="material-symbols-outlined">check</span>
              Đổi Mật Khẩu
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
    }
    
    .modal {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 420px;
      margin: 1rem;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    .modal-header {
      background: linear-gradient(135deg, #13b9a5 0%, #0d9488 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }
    
    .icon-wrapper {
      width: 64px;
      height: 64px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }
    
    .icon-wrapper .material-symbols-outlined {
      font-size: 32px;
    }
    
    .modal-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
    }
    
    .modal-header .subtitle {
      font-size: 0.9rem;
      opacity: 0.9;
      margin: 0;
    }
    
    .modal-body {
      padding: 2rem;
    }
    
    .form-group {
      margin-bottom: 1.25rem;
    }
    
    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }
    
    .form-group input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.2s;
      box-sizing: border-box;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: #13b9a5;
      box-shadow: 0 0 0 3px rgba(19, 185, 165, 0.1);
    }
    
    .error-message {
      background: #fef2f2;
      color: #dc2626;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    
    .btn {
      width: 100%;
      padding: 0.875rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #13b9a5 0%, #0d9488 100%);
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(19, 185, 165, 0.3);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
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
