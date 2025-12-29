import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

interface HelperProfile {
  id: number;
  userId: number;
  bio: string;
  careerStartDate: string;
  ratingAverage: number;
  activeArea: string;
}

@Component({
  selector: 'app-helper-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Hồ Sơ Của Tôi</h2>
      </div>

      @if (isLoading()) {
        <div class="loading">Đang tải...</div>
      } @else {
        <div class="profile-grid">
          <!-- Profile Card -->
          <div class="profile-card">
            <div class="profile-avatar">{{ getInitials() }}</div>
            <h3>{{ userEmail() }}</h3>
            <div class="rating">
              <span class="material-symbols-outlined">star</span>
              <span>{{ profile()?.ratingAverage || 0 | number:'1.1-1' }}</span>
            </div>
            <p class="experience">{{ getExperience() }}</p>
          </div>

          <!-- Edit Form -->
          <div class="edit-card">
            <h3>Chỉnh Sửa Hồ Sơ</h3>
            
            <div class="form-group">
              <label>Giới thiệu bản thân</label>
              <textarea [(ngModel)]="formData.bio" rows="4" placeholder="Mô tả về kinh nghiệm, kỹ năng của bạn..."></textarea>
            </div>

            <div class="form-group">
              <label>Khu vực hoạt động</label>
              <input type="text" [(ngModel)]="formData.activeArea" placeholder="VD: Quận 1, Quận 3, TP.HCM" />
            </div>

            <div class="form-group">
              <label>Ngày bắt đầu nghề</label>
              <input type="date" [(ngModel)]="formData.careerStartDate" />
            </div>

            <div class="form-actions">
              <button class="btn-primary" (click)="saveProfile()" [disabled]="isSaving()">
                @if (isSaving()) {
                  Đang lưu...
                } @else {
                  Lưu Thay Đổi
                }
              </button>
            </div>

            @if (successMessage()) {
              <div class="success-message">{{ successMessage() }}</div>
            }
            @if (errorMessage()) {
              <div class="error-message">{{ errorMessage() }}</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
    .loading { padding: 3rem; text-align: center; color: #638884; }
    .profile-grid { display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem; }
    @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } }
    .profile-card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 2rem; text-align: center; }
    .profile-avatar { width: 80px; height: 80px; margin: 0 auto 1rem; border-radius: 50%; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: 700; }
    .profile-card h3 { margin: 0 0 0.5rem; font-size: 1.1rem; word-break: break-all; }
    .rating { display: flex; align-items: center; justify-content: center; gap: 0.25rem; color: #f59e0b; font-weight: 600; margin-bottom: 0.5rem; }
    .rating .material-symbols-outlined { font-size: 20px; }
    .experience { margin: 0; color: #638884; font-size: 0.9rem; }
    .edit-card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 1.5rem; }
    .edit-card h3 { margin: 0 0 1.5rem; font-size: 1.1rem; font-weight: 600; }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; color: #111817; }
    .form-group input, .form-group textarea { width: 100%; padding: 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; font-family: inherit; }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #13b9a5; }
    .form-actions { margin-top: 1.5rem; }
    .btn-primary { padding: 0.75rem 1.5rem; background: #13b9a5; color: white; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { background: #0f9685; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .success-message { margin-top: 1rem; padding: 0.75rem; background: #dcfce7; color: #16a34a; border-radius: 8px; font-size: 0.9rem; }
    .error-message { margin-top: 1rem; padding: 0.75rem; background: #fef2f2; color: #dc2626; border-radius: 8px; font-size: 0.9rem; }
  `]
})
export class HelperProfileComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  isLoading = signal(true);
  isSaving = signal(false);
  profile = signal<HelperProfile | null>(null);
  successMessage = signal('');
  errorMessage = signal('');

  formData = {
    bio: '',
    activeArea: '',
    careerStartDate: ''
  };

  ngOnInit(): void {
    this.loadProfile();
  }

  userEmail(): string {
    return this.authService.currentUser()?.email || '';
  }

  getInitials(): string {
    const email = this.userEmail();
    return email.charAt(0).toUpperCase();
  }

  getExperience(): string {
    const date = this.profile()?.careerStartDate;
    if (!date) return 'Chưa cập nhật';
    const start = new Date(date);
    const years = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 365));
    if (years < 1) return 'Dưới 1 năm kinh nghiệm';
    return `${years} năm kinh nghiệm`;
  }

  loadProfile(): void {
    const userId = this.authService.currentUser()?.nameid;
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.http.get<HelperProfile>(`${environment.apiUrl}/helperprofiles/user/${userId}`).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.formData = {
          bio: data.bio || '',
          activeArea: data.activeArea || '',
          careerStartDate: data.careerStartDate?.split('T')[0] || ''
        };
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  saveProfile(): void {
    const userId = this.authService.currentUser()?.nameid;
    if (!userId) return;

    this.isSaving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.http.put(`${environment.apiUrl}/helperprofiles/user/${userId}`, {
      bio: this.formData.bio,
      activeArea: this.formData.activeArea,
      careerStartDate: this.formData.careerStartDate || null
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
