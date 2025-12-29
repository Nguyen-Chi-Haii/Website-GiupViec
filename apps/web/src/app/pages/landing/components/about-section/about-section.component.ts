import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Stat {
  value: string;
  label: string;
  icon: string;
}

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="about" class="about-section">
      <div class="container">
        <div class="about-grid">
          <!-- Left Content -->
          <div class="about-content">
            <span class="section-badge">Về Chúng Tôi</span>
            <h2 class="section-title">Đồng Hành Cùng Gia Đình Việt Từ 2020</h2>
            <p class="about-text">
              <strong>Giúp Việc Nhà</strong> ra đời với sứ mệnh mang đến giải pháp giúp việc gia đình 
              chuyên nghiệp, uy tín và tiện lợi nhất cho mọi gia đình Việt Nam.
            </p>
            <p class="about-text">
              Chúng tôi kết nối hàng ngàn người giúp việc đã được đào tạo bài bản với các gia đình 
              cần hỗ trợ, đảm bảo mọi dịch vụ đều đạt tiêu chuẩn chất lượng cao nhất.
            </p>
            
            <div class="stats-grid">
              @for (stat of stats; track stat.label) {
                <div class="stat-card">
                  <span class="material-symbols-outlined stat-icon">{{ stat.icon }}</span>
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              }
            </div>
          </div>

          <!-- Right Content - Image/Illustration -->
          <div class="about-visual">
            <div class="visual-card">
              <div class="visual-header">
                <span class="material-symbols-outlined">verified</span>
                <span>Cam Kết Của Chúng Tôi</span>
              </div>
              <ul class="commitment-list">
                <li>
                  <span class="material-symbols-outlined">shield</span>
                  <div>
                    <strong>Bảo Hiểm Toàn Diện</strong>
                    <p>Mọi dịch vụ đều được bảo hiểm 100%</p>
                  </div>
                </li>
                <li>
                  <span class="material-symbols-outlined">verified_user</span>
                  <div>
                    <strong>Nhân Viên Được Xác Minh</strong>
                    <p>Kiểm tra lý lịch và đào tạo chuyên nghiệp</p>
                  </div>
                </li>
                <li>
                  <span class="material-symbols-outlined">support_agent</span>
                  <div>
                    <strong>Hỗ Trợ 24/7</strong>
                    <p>Luôn sẵn sàng hỗ trợ mọi lúc mọi nơi</p>
                  </div>
                </li>
                <li>
                  <span class="material-symbols-outlined">payments</span>
                  <div>
                    <strong>Hoàn Tiền Nếu Không Hài Lòng</strong>
                    <p>Cam kết hoàn tiền 100% nếu bạn không hài lòng</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Team Section -->
        <div class="team-section">
          <h3 class="team-title">Đội Ngũ Xuất Sắc</h3>
          <p class="team-subtitle">Những người giúp việc tiêu biểu của chúng tôi</p>
          <div class="team-grid">
            @for (member of teamMembers; track member.name) {
              <div class="team-card">
                <div class="team-avatar">
                  <span class="initials">{{ getInitials(member.name) }}</span>
                </div>
                <div class="team-info">
                  <h4>{{ member.name }}</h4>
                  <span>{{ member.role }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .about-section {
      padding: 5rem 0;
      background: white;
    }

    .about-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: start;
      margin-bottom: 4rem;
    }

    @media (max-width: 968px) {
      .about-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    .section-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: var(--primary-light);
      color: var(--primary);
      border-radius: 2rem;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .section-title {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 1.5rem;
      line-height: 1.3;
    }

    .about-text {
      font-size: 1.05rem;
      color: var(--text-muted);
      line-height: 1.7;
      margin-bottom: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 2rem;
    }

    @media (max-width: 600px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .stat-card {
      background: var(--gray-50);
      padding: 1.25rem;
      border-radius: 1rem;
      text-align: center;
    }

    .stat-icon {
      font-size: 28px;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-dark);
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    .visual-card {
      background: linear-gradient(135deg, var(--primary-light) 0%, #e0f7f4 100%);
      border-radius: 1.5rem;
      padding: 2rem;
      border: 1px solid rgba(0, 191, 165, 0.2);
    }

    .visual-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--primary-dark);
    }

    .visual-header .material-symbols-outlined {
      font-size: 24px;
      color: var(--primary);
    }

    .commitment-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .commitment-list li {
      display: flex;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(0, 191, 165, 0.15);
    }

    .commitment-list li:last-child {
      border-bottom: none;
    }

    .commitment-list .material-symbols-outlined {
      font-size: 24px;
      color: var(--primary);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .commitment-list strong {
      display: block;
      color: var(--text-dark);
      margin-bottom: 0.25rem;
    }

    .commitment-list p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .team-section {
      text-align: center;
      border-top: 1px solid var(--gray-100);
      padding-top: 3rem;
    }

    .team-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 0.5rem;
    }

    .team-subtitle {
      color: var(--text-muted);
      margin-bottom: 2rem;
    }

    .team-grid {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .team-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--gray-50);
      padding: 1rem 1.5rem;
      border-radius: 1rem;
      transition: all 0.2s ease;
    }

    .team-card:hover {
      background: var(--primary-light);
    }

    .team-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .initials {
      color: white;
      font-weight: 600;
      font-size: 1rem;
    }

    .team-info h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-dark);
    }

    .team-info span {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    @media (max-width: 768px) {
      .section-title {
        font-size: 1.75rem;
      }
    }
  `]
})
export class AboutSectionComponent {
  stats: Stat[] = [
    { value: '10K+', label: 'Khách Hàng', icon: 'groups' },
    { value: '500+', label: 'Người Giúp Việc', icon: 'badge' },
    { value: '50K+', label: 'Lượt Đặt', icon: 'task_alt' }
  ];

  teamMembers: TeamMember[] = [
    { name: 'Nguyễn Thị Lan', role: 'Giúp việc 5 năm KN', avatar: '' },
    { name: 'Trần Văn Minh', role: 'Chăm sóc người già', avatar: '' },
    { name: 'Lê Thị Hương', role: 'Nấu ăn chuyên nghiệp', avatar: '' },
    { name: 'Phạm Văn Đức', role: 'Trông trẻ 3 năm KN', avatar: '' }
  ];

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
