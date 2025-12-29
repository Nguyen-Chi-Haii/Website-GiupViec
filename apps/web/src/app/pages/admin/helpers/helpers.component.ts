import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserResponse, HelperProfile } from '../../../core/services/admin.service';

interface HelperWithProfile extends UserResponse {
  profile?: HelperProfile;
}

@Component({
  selector: 'app-admin-helpers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Quản Lý Người Giúp Việc</h2>
        <div class="header-actions">
          <div class="view-toggle">
            <button class="toggle-btn" [class.active]="viewMode() === 'card'" (click)="viewMode.set('card')">
              <span class="material-symbols-outlined">grid_view</span>
            </button>
            <button class="toggle-btn" [class.active]="viewMode() === 'table'" (click)="viewMode.set('table')">
              <span class="material-symbols-outlined">table_rows</span>
            </button>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading">Đang tải...</div>
      } @else {
        @if (viewMode() === 'card') {
          <!-- Card View -->
          <div class="helpers-grid">
            @for (helper of helpers(); track helper.id) {
              <div class="helper-card">
                <div class="helper-avatar">{{ getInitials(helper.fullName) }}</div>
                <div class="helper-info">
                  <h3>{{ helper.fullName }}</h3>
                  <p class="helper-email">{{ helper.email }}</p>
                  <p class="helper-phone">{{ helper.phoneNumber || 'Chưa có SĐT' }}</p>
                </div>
                <div class="helper-stats">
                  <div class="stat">
                    <span class="material-symbols-outlined star">star</span>
                    <span>{{ helper.profile?.ratingAverage || 0 | number:'1.1-1' }}</span>
                  </div>
                  <div class="stat">
                    <span class="material-symbols-outlined">work_history</span>
                    <span>{{ getExperienceLabel(helper.profile?.careerStartDate) }}</span>
                  </div>
                </div>
                @if (helper.profile?.activeArea) {
                  <div class="helper-area">
                    <span class="material-symbols-outlined">location_on</span>
                    {{ helper.profile?.activeArea }}
                  </div>
                }
                <div class="helper-actions">
                  <button class="btn-outline" (click)="viewProfile(helper)">
                    <span class="material-symbols-outlined">visibility</span>
                    Xem hồ sơ
                  </button>
                </div>
              </div>
            } @empty {
              <div class="empty-state">Chưa có người giúp việc nào</div>
            }
          </div>
        } @else {
          <!-- Table View -->
          <div class="card">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Khu vực</th>
                    <th>Đánh giá</th>
                    <th>Kinh nghiệm</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  @for (helper of helpers(); track helper.id) {
                    <tr>
                      <td class="font-medium">#{{ helper.id }}</td>
                      <td>
                        <div class="user-cell">
                          <div class="user-avatar">{{ getInitials(helper.fullName) }}</div>
                          <span>{{ helper.fullName }}</span>
                        </div>
                      </td>
                      <td class="text-muted">{{ helper.email }}</td>
                      <td>{{ helper.phoneNumber || '-' }}</td>
                      <td>{{ helper.profile?.activeArea || '-' }}</td>
                      <td>
                        <div class="rating">
                          <span class="material-symbols-outlined star">star</span>
                          {{ helper.profile?.ratingAverage || 0 | number:'1.1-1' }}
                        </div>
                      </td>
                      <td>{{ getExperienceLabel(helper.profile?.careerStartDate) }}</td>
                      <td>
                        <button class="icon-btn" title="Xem chi tiết" (click)="viewProfile(helper)">
                          <span class="material-symbols-outlined">visibility</span>
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="8" class="empty-state">Chưa có người giúp việc nào</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }

      <!-- Profile Detail Modal -->
      @if (selectedHelper()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Hồ Sơ Người Giúp Việc</h3>
              <button class="close-btn" (click)="closeModal()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="profile-header">
                <div class="profile-avatar">{{ getInitials(selectedHelper()!.fullName) }}</div>
                <div class="profile-info">
                  <h2>{{ selectedHelper()!.fullName }}</h2>
                  <p>{{ selectedHelper()!.email }}</p>
                  <p>{{ selectedHelper()!.phoneNumber || 'Chưa cập nhật SĐT' }}</p>
                </div>
              </div>
              <div class="profile-stats">
                <div class="stat-card">
                  <span class="material-symbols-outlined">star</span>
                  <div class="stat-value">{{ selectedHelper()!.profile?.ratingAverage || 0 | number:'1.1-1' }}</div>
                  <div class="stat-label">Đánh giá</div>
                </div>
                <div class="stat-card">
                  <span class="material-symbols-outlined">work_history</span>
                  <div class="stat-value">{{ getExperienceLabel(selectedHelper()!.profile?.careerStartDate) }}</div>
                  <div class="stat-label">Kinh nghiệm</div>
                </div>
                <div class="stat-card">
                  <span class="material-symbols-outlined">location_on</span>
                  <div class="stat-value">{{ selectedHelper()!.profile?.activeArea || 'N/A' }}</div>
                  <div class="stat-label">Khu vực</div>
                </div>
              </div>
              @if (selectedHelper()!.profile?.bio) {
                <div class="profile-bio">
                  <h4>Giới thiệu bản thân</h4>
                  <p>{{ selectedHelper()!.profile?.bio }}</p>
                </div>
              }
              <div class="profile-details">
                <div class="detail-row">
                  <span class="label">ID User:</span>
                  <span class="value">#{{ selectedHelper()!.id }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Ngày tham gia:</span>
                  <span class="value">{{ selectedHelper()!.createdAt | date:'dd/MM/yyyy' }}</span>
                </div>
                @if (selectedHelper()!.profile?.careerStartDate) {
                  <div class="detail-row">
                    <span class="label">Bắt đầu nghề:</span>
                    <span class="value">{{ selectedHelper()!.profile?.careerStartDate | date:'MM/yyyy' }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
    .view-toggle { display: flex; background: #f6f8f8; border-radius: 8px; padding: 4px; }
    .toggle-btn { width: 36px; height: 36px; border: none; background: transparent; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #638884; transition: all 0.2s; }
    .toggle-btn.active { background: white; color: #13b9a5; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .toggle-btn .material-symbols-outlined { font-size: 20px; }
    .helpers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
    .helper-card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1rem; transition: box-shadow 0.2s; }
    .helper-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .helper-avatar, .user-avatar, .profile-avatar { background: linear-gradient(135deg, #13b9a5 0%, #0f9685 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; }
    .helper-avatar { width: 64px; height: 64px; border-radius: 50%; font-size: 1.25rem; }
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; font-size: 0.75rem; }
    .profile-avatar { width: 80px; height: 80px; border-radius: 50%; font-size: 1.5rem; }
    .helper-info h3 { margin: 0; font-size: 1.1rem; font-weight: 600; color: #111817; }
    .helper-email, .helper-phone { margin: 0.25rem 0 0; font-size: 0.875rem; color: #638884; }
    .helper-stats { display: flex; gap: 1.5rem; }
    .stat { display: flex; align-items: center; gap: 0.25rem; font-size: 0.875rem; color: #638884; }
    .stat .material-symbols-outlined { font-size: 18px; }
    .stat .star { color: #f59e0b; }
    .helper-area { font-size: 0.875rem; color: #638884; display: flex; align-items: center; gap: 0.25rem; }
    .helper-area .material-symbols-outlined { font-size: 16px; color: #13b9a5; }
    .helper-actions { width: 100%; }
    .btn-outline { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.75rem; background: transparent; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; font-weight: 500; color: #111817; cursor: pointer; transition: all 0.2s; }
    .btn-outline:hover { background: #f6f8f8; border-color: #13b9a5; color: #13b9a5; }
    .btn-outline .material-symbols-outlined { font-size: 18px; }
    .loading, .empty-state { padding: 3rem; text-align: center; color: #638884; }
    .card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .data-table th { text-align: left; padding: 1rem; background: #f6f8f8; color: #638884; font-weight: 500; font-size: 0.75rem; text-transform: uppercase; white-space: nowrap; }
    .data-table td { padding: 1rem; border-top: 1px solid #e5e7eb; }
    .data-table tr:hover { background: #f9fafb; }
    .font-medium { font-weight: 500; }
    .text-muted { color: #638884; }
    .user-cell { display: flex; align-items: center; gap: 0.75rem; }
    .rating { display: flex; align-items: center; gap: 0.25rem; }
    .icon-btn { width: 32px; height: 32px; border: none; background: #f6f8f8; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #638884; transition: all 0.2s; }
    .icon-btn:hover { background: #e5e7eb; color: #111817; }
    .icon-btn .material-symbols-outlined { font-size: 18px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 16px; width: 90%; max-width: 500px; max-height: 90vh; overflow: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; }
    .close-btn { background: none; border: none; cursor: pointer; color: #638884; }
    .modal-body { padding: 1.5rem; }
    .profile-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .profile-info h2 { margin: 0; font-size: 1.25rem; font-weight: 700; }
    .profile-info p { margin: 0.25rem 0 0; font-size: 0.875rem; color: #638884; }
    .profile-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: #f6f8f8; border-radius: 12px; padding: 1rem; text-align: center; }
    .stat-card .material-symbols-outlined { font-size: 24px; color: #13b9a5; }
    .stat-value { font-size: 1.1rem; font-weight: 700; color: #111817; margin-top: 0.5rem; }
    .stat-label { font-size: 0.75rem; color: #638884; margin-top: 0.25rem; }
    .profile-bio { background: #f6f8f8; border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem; }
    .profile-bio h4 { margin: 0 0 0.5rem; font-size: 0.875rem; font-weight: 600; color: #111817; }
    .profile-bio p { margin: 0; font-size: 0.875rem; color: #638884; line-height: 1.5; }
    .profile-details { border-top: 1px solid #e5e7eb; padding-top: 1rem; }
    .detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.875rem; }
    .detail-row .label { color: #638884; }
    .detail-row .value { font-weight: 500; color: #111817; }
  `]
})
export class AdminHelpersComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  helpers = signal<HelperWithProfile[]>([]);
  selectedHelper = signal<HelperWithProfile | null>(null);
  isLoading = signal(true);
  viewMode = signal<'card' | 'table'>('card');

  ngOnInit(): void {
    this.loadHelpers();
  }

  loadHelpers(): void {
    // First get all users with Helper role
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        const helperUsers = users.filter(u => u.role === 'Helper');
        
        // Then fetch profile for each helper
        if (helperUsers.length === 0) {
          this.helpers.set([]);
          this.isLoading.set(false);
          return;
        }

        // Load profiles for each helper
        let loaded = 0;
        const helpersWithProfile: HelperWithProfile[] = [];

        helperUsers.forEach(user => {
          this.adminService.getHelperProfile(user.id).subscribe({
            next: (profile) => {
              helpersWithProfile.push({ ...user, profile });
              loaded++;
              if (loaded === helperUsers.length) {
                this.helpers.set(helpersWithProfile);
                this.isLoading.set(false);
              }
            },
            error: () => {
              // No profile found, still add the user
              helpersWithProfile.push({ ...user });
              loaded++;
              if (loaded === helperUsers.length) {
                this.helpers.set(helpersWithProfile);
                this.isLoading.set(false);
              }
            }
          });
        });
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading.set(false);
      }
    });
  }

  viewProfile(helper: HelperWithProfile): void {
    this.selectedHelper.set(helper);
  }

  closeModal(): void {
    this.selectedHelper.set(null);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getExperienceLabel(careerStartDate?: string): string {
    if (!careerStartDate) return 'Mới';
    const start = new Date(careerStartDate);
    const now = new Date();
    const years = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365));
    if (years < 1) return 'Dưới 1 năm';
    return `${years} năm`;
  }
}
