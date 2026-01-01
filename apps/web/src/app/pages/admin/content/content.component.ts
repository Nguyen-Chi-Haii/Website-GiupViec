import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';

interface LandingContent {
  heroTitle: string;
  heroSubtitle: string;
  heroBannerUrl: string;
  statsCustomers: string;
}

interface JDContent {
  email: string;
  hotline: string;
  salaryRange: string;
  requirements: string[];
  benefits: string[];
  documents: string[];
}

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Quản Lý Nội Dung</h2>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'landing'" (click)="activeTab = 'landing'">
          <span class="material-symbols-outlined">web</span>
          Trang Landing
        </button>
        <button class="tab" [class.active]="activeTab === 'jd'" (click)="activeTab = 'jd'">
          <span class="material-symbols-outlined">work</span>
          Trang Tuyển Dụng (JD)
        </button>
      </div>

      <!-- Landing Page Content -->
      @if (activeTab === 'landing') {
        <div class="content-card">
          <h3>Nội Dung Trang Chủ</h3>
          
          <div class="form-section">
            <h4>Hero Section</h4>
            <div class="form-group">
              <label>Tiêu đề chính</label>
              <input type="text" [(ngModel)]="landingContent.heroTitle" />
            </div>
            <div class="form-group">
              <label>Mô tả phụ</label>
              <textarea rows="3" [(ngModel)]="landingContent.heroSubtitle"></textarea>
            </div>
            <div class="form-group">
              <label>URL hình banner</label>
              <input type="text" [(ngModel)]="landingContent.heroBannerUrl" placeholder="https://..." />
            </div>
            <div class="form-group">
              <label>Số khách hàng (hiển thị)</label>
              <input type="text" [(ngModel)]="landingContent.statsCustomers" placeholder="VD: 10,000" />
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-primary" (click)="saveLanding()">
              <span class="material-symbols-outlined">save</span>
              Lưu thay đổi
            </button>
          </div>
        </div>
      }

      <!-- JD Page Content -->
      @if (activeTab === 'jd') {
        <div class="content-card">
          <h3>Nội Dung Trang Tuyển Dụng</h3>
          
          <div class="form-section">
            <h4>Thông tin liên hệ</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Email tuyển dụng</label>
                <input type="email" [(ngModel)]="jdContent.email" />
              </div>
              <div class="form-group">
                <label>Hotline</label>
                <input type="text" [(ngModel)]="jdContent.hotline" />
              </div>
            </div>
            <div class="form-group">
              <label>Mức lương</label>
              <input type="text" [(ngModel)]="jdContent.salaryRange" placeholder="VD: 50K - 100K/giờ" />
            </div>
          </div>

          <div class="form-section">
            <h4>Yêu cầu ứng viên (mỗi dòng 1 yêu cầu)</h4>
            <div class="form-group">
              <textarea rows="5" [(ngModel)]="requirementsText"></textarea>
            </div>
          </div>

          <div class="form-section">
            <h4>Quyền lợi (mỗi dòng 1 quyền lợi)</h4>
            <div class="form-group">
              <textarea rows="4" [(ngModel)]="benefitsText"></textarea>
            </div>
          </div>

          <div class="form-section">
            <h4>Hồ sơ cần chuẩn bị (mỗi dòng 1 giấy tờ)</h4>
            <div class="form-group">
              <textarea rows="5" [(ngModel)]="documentsText"></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-primary" (click)="saveJD()">
              <span class="material-symbols-outlined">save</span>
              Lưu thay đổi
            </button>
          </div>
        </div>
      }

      @if (savedMessage()) {
        <div class="toast">
          <span class="material-symbols-outlined">check_circle</span>
          {{ savedMessage() }}
        </div>
      }
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

    .tabs {
      display: flex;
      gap: 0.5rem;
      background: white;
      padding: 0.5rem;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }

    .tab {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      color: #638884;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab:hover {
      background: #f6f8f8;
    }

    .tab.active {
      background: rgba(19, 185, 165, 0.1);
      color: #13b9a5;
    }

    .tab .material-symbols-outlined {
      font-size: 20px;
    }

    .content-card {
      background: white;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      padding: 1.5rem;
    }

    .content-card h3 {
      margin: 0 0 1.5rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #111817;
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .form-section:last-of-type {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .form-section h4 {
      margin: 0 0 1rem;
      font-size: 1rem;
      font-weight: 600;
      color: #111817;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #111817;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.9rem;
      font-family: inherit;
      resize: vertical;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #13b9a5;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: #13b9a5;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: #0f9685;
    }

    .btn-primary .material-symbols-outlined {
      font-size: 18px;
    }

    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      background: #16a34a;
      color: white;
      border-radius: 8px;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class AdminContentComponent implements OnInit {
  private readonly notification = inject(NotificationService);
  
  activeTab = 'landing';
  savedMessage = signal('');

  landingContent: LandingContent = {
    heroTitle: 'Giúp Việc Nhà - Dịch Vụ Tin Cậy Cho Gia Đình Bạn',
    heroSubtitle: 'Giải pháp vệ sinh toàn diện, chuyên nghiệp và tận tâm.',
    heroBannerUrl: '',
    statsCustomers: '10,000'
  };

  jdContent: JDContent = {
    email: 'tuyendung@giupviecnha.vn',
    hotline: '0901 234 567',
    salaryRange: '50K - 100K/giờ',
    requirements: [],
    benefits: [],
    documents: []
  };

  requirementsText = '';
  benefitsText = '';
  documentsText = '';

  ngOnInit(): void {
    this.loadContent();
  }

  loadContent(): void {
    // Load from localStorage
    const savedLanding = localStorage.getItem('admin_landing_content');
    if (savedLanding) {
      this.landingContent = JSON.parse(savedLanding);
    }

    const savedJD = localStorage.getItem('admin_jd_content');
    if (savedJD) {
      this.jdContent = JSON.parse(savedJD);
      this.requirementsText = this.jdContent.requirements.join('\n');
      this.benefitsText = this.jdContent.benefits.join('\n');
      this.documentsText = this.jdContent.documents.join('\n');
    } else {
      // Default values
      this.requirementsText = `Độ tuổi 18-55, sức khỏe tốt
Cư trú ổn định tại TP.HCM
Biết đọc, viết cơ bản
Không có tiền án tiền sự`;
      this.benefitsText = `Lương cao, thanh toán đúng hạn
Giờ làm việc linh hoạt
Được đào tạo miễn phí
Có bảo hiểm tai nạn`;
      this.documentsText = `CCCD/CMND (2 mặt, bản photo công chứng) - Bắt buộc
Sơ yếu lý lịch có xác nhận địa phương - Bắt buộc
Giấy khám sức khỏe (trong vòng 6 tháng) - Bắt buộc
Hình thẻ 3x4 (2 tấm) - Bắt buộc
Hộ khẩu hoặc KT3 (bản photo)
Giấy xác nhận công việc cũ (nếu có)`;
    }
  }

  saveLanding(): void {
    localStorage.setItem('admin_landing_content', JSON.stringify(this.landingContent));
    this.notification.success('Đã lưu nội dung trang Landing!');
  }

  saveJD(): void {
    this.jdContent.requirements = this.requirementsText.split('\n').filter(s => s.trim());
    this.jdContent.benefits = this.benefitsText.split('\n').filter(s => s.trim());
    this.jdContent.documents = this.documentsText.split('\n').filter(s => s.trim());
    
    localStorage.setItem('admin_jd_content', JSON.stringify(this.jdContent));
    this.notification.success('Đã lưu nội dung trang Tuyển Dụng!');
  }

  showSavedMessage(msg: string): void {
    this.savedMessage.set(msg);
    setTimeout(() => this.savedMessage.set(''), 3000);
  }
}
