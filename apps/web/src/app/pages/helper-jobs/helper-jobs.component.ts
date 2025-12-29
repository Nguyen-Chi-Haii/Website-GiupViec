import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Requirement {
  icon: string;
  title: string;
  description: string;
}

interface Document {
  name: string;
  required: boolean;
}

interface Benefit {
  icon: string;
  title: string;
}

@Component({
  selector: 'app-helper-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="jobs-page">
      <!-- Header -->
      <header class="jobs-header">
        <div class="container">
          <a routerLink="/" class="back-link">
            <span class="material-symbols-outlined">arrow_back</span>
            Quay về trang chủ
          </a>
        </div>
      </header>

      <!-- Hero Banner -->
      <section class="jobs-hero">
        <div class="container">
          <div class="hero-badge">🎉 Đang tuyển dụng</div>
          <h1>Trở Thành Người Giúp Việc Chuyên Nghiệp</h1>
          <p>
            Gia nhập đội ngũ hơn 500+ người giúp việc tin cậy. Thu nhập ổn định, 
            lịch làm việc linh hoạt, được đào tạo miễn phí.
          </p>
          <div class="hero-highlights">
            <div class="highlight">
              <span class="material-symbols-outlined">payments</span>
              <span>50K - 100K/giờ</span>
            </div>
            <div class="highlight">
              <span class="material-symbols-outlined">schedule</span>
              <span>Giờ linh hoạt</span>
            </div>
            <div class="highlight">
              <span class="material-symbols-outlined">shield</span>
              <span>Có bảo hiểm</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Requirements Section -->
      <section class="requirements-section">
        <div class="container">
          <h2>Yêu Cầu Ứng Viên</h2>
          <div class="requirements-grid">
            @for (req of requirements; track req.title) {
              <div class="requirement-card">
                <div class="req-icon">
                  <span class="material-symbols-outlined">{{ req.icon }}</span>
                </div>
                <h3>{{ req.title }}</h3>
                <p>{{ req.description }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Benefits Section -->
      <section class="benefits-section">
        <div class="container">
          <h2>Quyền Lợi Khi Gia Nhập</h2>
          <div class="benefits-grid">
            @for (benefit of benefits; track benefit.title) {
              <div class="benefit-item">
                <span class="material-symbols-outlined">{{ benefit.icon }}</span>
                <span>{{ benefit.title }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Documents Section -->
      <section class="documents-section">
        <div class="container">
          <h2>Hồ Sơ Cần Chuẩn Bị</h2>
          <div class="documents-card">
            <ul class="documents-list">
              @for (doc of documents; track doc.name) {
                <li [class.required]="doc.required">
                  <span class="material-symbols-outlined">
                    {{ doc.required ? 'check_circle' : 'radio_button_unchecked' }}
                  </span>
                  <span>{{ doc.name }}</span>
                  @if (doc.required) {
                    <span class="badge">Bắt buộc</span>
                  }
                </li>
              }
            </ul>
          </div>
        </div>
      </section>

      <!-- Apply Section -->
      <section class="apply-section">
        <div class="container">
          <div class="apply-card">
            <div class="apply-content">
              <h2>Sẵn Sàng Ứng Tuyển?</h2>
              <p>Gửi hồ sơ của bạn qua email hoặc liên hệ hotline để được hỗ trợ</p>
            </div>
            <div class="apply-actions">
              <a href="mailto:tuyendung@giupviecnha.vn?subject=Ứng tuyển làm người giúp việc" class="btn btn-primary btn-lg">
                <span class="material-symbols-outlined">mail</span>
                tuyendung&#64;giupviecnha.vn
              </a>
              <a href="tel:0901234567" class="btn btn-outline btn-lg">
                <span class="material-symbols-outlined">phone</span>
                Hotline: 0901 234 567
              </a>
            </div>
          </div>

          <div class="apply-note">
            <span class="material-symbols-outlined">info</span>
            <p>
              <strong>Lưu ý:</strong> Vui lòng gửi đầy đủ hồ sơ qua email với tiêu đề 
              "Ứng tuyển - [Họ tên] - [Số điện thoại]". Chúng tôi sẽ liên hệ trong vòng 24-48 giờ.
            </p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="jobs-footer">
        <div class="container">
          <p>© 2024 Giúp Việc Nhà. Mọi quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .jobs-page {
      min-height: 100vh;
      background: #f8fffe;
    }

    .jobs-header {
      background: white;
      padding: 1rem 0;
      border-bottom: 1px solid var(--gray-100);
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-dark);
      font-weight: 500;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: var(--primary);
    }

    .jobs-hero {
      background: linear-gradient(135deg, var(--primary) 0%, #0f9685 100%);
      color: white;
      padding: 4rem 0;
      text-align: center;
    }

    .hero-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    .jobs-hero h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: white;
    }

    .jobs-hero p {
      font-size: 1.125rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto 2rem;
    }

    .hero-highlights {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 2rem;
    }

    .highlight {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.15);
      padding: 0.75rem 1.25rem;
      border-radius: 0.75rem;
    }

    .highlight .material-symbols-outlined {
      font-size: 20px;
    }

    /* Sections common styles */
    section {
      padding: 4rem 0;
    }

    section h2 {
      font-size: 1.75rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 2rem;
      color: var(--text-dark);
    }

    /* Requirements */
    .requirements-section {
      background: white;
    }

    .requirements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .requirement-card {
      background: var(--gray-50);
      padding: 1.5rem;
      border-radius: 1rem;
      text-align: center;
    }

    .req-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    .req-icon .material-symbols-outlined {
      font-size: 28px;
      color: var(--primary);
    }

    .requirement-card h3 {
      font-size: 1.125rem;
      margin-bottom: 0.5rem;
    }

    .requirement-card p {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    /* Benefits */
    .benefits-section {
      background: var(--primary-light);
    }

    .benefits-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
    }

    .benefit-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
      padding: 0.75rem 1.25rem;
      border-radius: 2rem;
      font-weight: 500;
    }

    .benefit-item .material-symbols-outlined {
      color: var(--primary);
      font-size: 20px;
    }

    /* Documents */
    .documents-section {
      background: white;
    }

    .documents-card {
      max-width: 600px;
      margin: 0 auto;
      background: var(--gray-50);
      border-radius: 1rem;
      padding: 2rem;
    }

    .documents-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .documents-list li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--gray-100);
    }

    .documents-list li:last-child {
      border-bottom: none;
    }

    .documents-list .material-symbols-outlined {
      font-size: 20px;
      color: var(--gray-400);
    }

    .documents-list li.required .material-symbols-outlined {
      color: var(--primary);
    }

    .badge {
      margin-left: auto;
      background: var(--primary-light);
      color: var(--primary);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    /* Apply Section */
    .apply-section {
      background: linear-gradient(180deg, #f8fffe 0%, white 100%);
    }

    .apply-card {
      background: linear-gradient(135deg, var(--primary) 0%, #0f9685 100%);
      border-radius: 1.5rem;
      padding: 3rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      color: white;
    }

    .apply-content h2 {
      color: white;
      text-align: left;
      margin-bottom: 0.5rem;
    }

    .apply-content p {
      opacity: 0.9;
    }

    .apply-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .apply-actions .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }

    .apply-actions .btn-primary {
      background: white;
      color: var(--primary);
    }

    .apply-actions .btn-outline {
      border-color: rgba(255, 255, 255, 0.5);
      color: white;
    }

    .apply-actions .btn-outline:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .apply-note {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-top: 2rem;
      padding: 1rem;
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 0.75rem;
    }

    .apply-note .material-symbols-outlined {
      color: #f59e0b;
      flex-shrink: 0;
    }

    .apply-note p {
      margin: 0;
      font-size: 0.9rem;
      color: #92400e;
    }

    /* Footer */
    .jobs-footer {
      background: var(--text-dark);
      color: white;
      text-align: center;
      padding: 1.5rem 0;
    }

    .jobs-footer p {
      font-size: 0.875rem;
      opacity: 0.7;
    }

    @media (max-width: 768px) {
      .jobs-hero h1 {
        font-size: 1.75rem;
      }

      .apply-card {
        flex-direction: column;
        text-align: center;
      }

      .apply-content h2 {
        text-align: center;
      }

      .apply-actions {
        width: 100%;
      }
    }
  `]
})
export class HelperJobsComponent {
  requirements: Requirement[] = [
    {
      icon: 'person',
      title: 'Độ tuổi 18-55',
      description: 'Có sức khỏe tốt, không mắc bệnh truyền nhiễm'
    },
    {
      icon: 'location_city',
      title: 'Cư trú ổn định',
      description: 'Có hộ khẩu hoặc KT3 tại TP.HCM hoặc tỉnh lân cận'
    },
    {
      icon: 'school',
      title: 'Biết đọc, viết',
      description: 'Tối thiểu tốt nghiệp tiểu học, giao tiếp tốt'
    },
    {
      icon: 'verified_user',
      title: 'Không tiền án tiền sự',
      description: 'Lý lịch trong sạch, trung thực và đáng tin cậy'
    }
  ];

  documents: Document[] = [
    { name: 'CCCD/CMND (2 mặt, bản photo công chứng)', required: true },
    { name: 'Sơ yếu lý lịch có xác nhận địa phương', required: true },
    { name: 'Giấy khám sức khỏe (trong vòng 6 tháng)', required: true },
    { name: 'Hình thẻ 3x4 (2 tấm)', required: true },
    { name: 'Hộ khẩu hoặc KT3 (bản photo)', required: false },
    { name: 'Giấy xác nhận công việc cũ (nếu có)', required: false },
    { name: 'Chứng chỉ nghề (nếu có)', required: false }
  ];

  benefits: Benefit[] = [
    { icon: 'payments', title: 'Lương cao, thanh toán đúng hạn' },
    { icon: 'schedule', title: 'Giờ làm việc linh hoạt' },
    { icon: 'school', title: 'Được đào tạo miễn phí' },
    { icon: 'shield', title: 'Có bảo hiểm tai nạn' },
    { icon: 'trending_up', title: 'Cơ hội thăng tiến' },
    { icon: 'support_agent', title: 'Hỗ trợ 24/7' }
  ];
}
