import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, UserResponse } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-helpers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Quản Lý Người Giúp Việc</h2>
      </div>

      <div class="helpers-grid">
        @if (isLoading()) {
          <div class="loading">Đang tải...</div>
        } @else {
          @for (helper of helpers(); track helper.id) {
            <div class="helper-card">
              <div class="helper-avatar">
                {{ getInitials(helper.fullName) }}
              </div>
              <div class="helper-info">
                <h3>{{ helper.fullName }}</h3>
                <p class="helper-email">{{ helper.email }}</p>
                <p class="helper-phone">{{ helper.phoneNumber }}</p>
              </div>
              <div class="helper-stats">
                <div class="stat">
                  <span class="material-symbols-outlined">star</span>
                  <span>4.8</span>
                </div>
                <div class="stat">
                  <span class="material-symbols-outlined">work_history</span>
                  <span>3 năm</span>
                </div>
              </div>
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
        }
      </div>
    </div>
  `,
  styles: [`
    .page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .helpers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .helper-card {
      background: white;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1rem;
    }

    .helper-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #13b9a5 0%, #0f9685 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.25rem;
    }

    .helper-info h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #111817;
    }

    .helper-email, .helper-phone {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: #638884;
    }

    .helper-stats {
      display: flex;
      gap: 1.5rem;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: #638884;
    }

    .stat .material-symbols-outlined {
      font-size: 18px;
      color: #f59e0b;
    }

    .helper-actions {
      width: 100%;
    }

    .btn-outline {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem;
      background: transparent;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #111817;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-outline:hover {
      background: #f6f8f8;
      border-color: #13b9a5;
      color: #13b9a5;
    }

    .btn-outline .material-symbols-outlined {
      font-size: 18px;
    }

    .loading, .empty-state {
      grid-column: 1 / -1;
      padding: 3rem;
      text-align: center;
      color: #638884;
    }
  `]
})
export class AdminHelpersComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  helpers = signal<UserResponse[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadHelpers();
  }

  loadHelpers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.helpers.set(data.filter(u => u.role === 'Helper'));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading.set(false);
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  viewProfile(helper: UserResponse): void {
    alert(`Xem hồ sơ: ${helper.fullName} (ID: ${helper.id})`);
    // TODO: Navigate to profile detail or open modal
  }
}
