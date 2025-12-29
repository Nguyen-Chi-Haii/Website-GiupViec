import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface PricingPlan {
  name: string;
  icon: string;
  price: number;
  unit: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

@Component({
  selector: 'app-pricing-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section id="pricing" class="pricing-section">
      <div class="container">
        <div class="section-header">
          <span class="section-badge">Bảng Giá</span>
          <h2 class="section-title">Giá Cả Minh Bạch, Không Phí Ẩn</h2>
          <p class="section-subtitle">
            Chọn gói dịch vụ phù hợp với nhu cầu của bạn. Tất cả đều bao gồm bảo hiểm và hỗ trợ 24/7.
          </p>
        </div>

        <div class="pricing-grid">
          @for (plan of pricingPlans; track plan.name) {
            <div class="pricing-card" [class.popular]="plan.isPopular">
              @if (plan.isPopular) {
                <div class="popular-badge">Phổ Biến Nhất</div>
              }
              <div class="plan-icon">
                <span class="material-symbols-outlined">{{ plan.icon }}</span>
              </div>
              <h3 class="plan-name">{{ plan.name }}</h3>
              <p class="plan-description">{{ plan.description }}</p>
              <div class="plan-price">
                <span class="price">{{ formatPrice(plan.price) }}</span>
                <span class="unit">/ {{ plan.unit }}</span>
              </div>
              <ul class="plan-features">
                @for (feature of plan.features; track feature) {
                  <li>
                    <span class="material-symbols-outlined check">check_circle</span>
                    {{ feature }}
                  </li>
                }
              </ul>
              <a routerLink="/booking" class="btn" [class.btn-primary]="plan.isPopular" [class.btn-outline]="!plan.isPopular">
                Đặt Ngay
              </a>
            </div>
          }
        </div>

        <div class="pricing-note">
          <span class="material-symbols-outlined">info</span>
          <p>Giá trên chưa bao gồm phí di chuyển (nếu có). Liên hệ để được báo giá chi tiết.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .pricing-section {
      padding: 5rem 0;
      background: linear-gradient(180deg, #f8fffe 0%, #fff 100%);
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
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
      margin-bottom: 1rem;
    }

    .section-subtitle {
      font-size: 1.125rem;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto;
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .pricing-card {
      background: white;
      border-radius: 1.5rem;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 2px solid transparent;
      transition: all 0.3s ease;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .pricing-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0, 191, 165, 0.15);
    }

    .pricing-card.popular {
      border-color: var(--primary);
      box-shadow: 0 8px 30px rgba(0, 191, 165, 0.2);
    }

    .popular-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--primary);
      color: white;
      padding: 0.35rem 1rem;
      border-radius: 2rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .plan-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .plan-icon .material-symbols-outlined {
      font-size: 28px;
      color: var(--primary);
    }

    .plan-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 0.5rem;
    }

    .plan-description {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
    }

    .plan-price {
      margin-bottom: 1.5rem;
    }

    .price {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary);
    }

    .unit {
      font-size: 1rem;
      color: var(--text-muted);
    }

    .plan-features {
      list-style: none;
      padding: 0;
      margin: 0 0 2rem;
      flex: 1;
    }

    .plan-features li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      color: var(--text-dark);
      font-size: 0.95rem;
    }

    .plan-features .check {
      font-size: 20px;
      color: var(--primary);
    }

    .btn {
      width: 100%;
      padding: 1rem;
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-dark);
    }

    .btn-outline {
      background: transparent;
      border: 2px solid var(--primary);
      color: var(--primary);
    }

    .btn-outline:hover {
      background: var(--primary);
      color: white;
    }

    .pricing-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 2rem;
      padding: 1rem;
      background: var(--gray-50);
      border-radius: 0.75rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .pricing-note .material-symbols-outlined {
      color: var(--text-muted);
      font-size: 20px;
    }

    .pricing-note p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    @media (max-width: 768px) {
      .section-title {
        font-size: 1.75rem;
      }
      
      .pricing-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PricingSectionComponent {
  pricingPlans: PricingPlan[] = [
    {
      name: 'Dọn Dẹp Cơ Bản',
      icon: 'mop',
      price: 50000,
      unit: 'giờ',
      description: 'Dịch vụ dọn dẹp hàng ngày cho gia đình',
      features: [
        'Quét dọn, lau nhà',
        'Dọn phòng ngủ, phòng khách',
        'Vệ sinh nhà bếp cơ bản',
        'Đổ rác, sắp xếp đồ đạc'
      ]
    },
    {
      name: 'Dọn Dẹp Toàn Diện',
      icon: 'cleaning_services',
      price: 80000,
      unit: 'giờ',
      description: 'Dọn dẹp sâu, vệ sinh tổng thể',
      features: [
        'Tất cả dịch vụ cơ bản',
        'Vệ sinh nhà tắm, toilet',
        'Lau kính, cửa sổ',
        'Giặt rèm, vệ sinh máy lạnh',
        'Hỗ trợ nấu ăn nhẹ'
      ],
      isPopular: true
    },
    {
      name: 'Chăm Sóc Gia Đình',
      icon: 'family_restroom',
      price: 100000,
      unit: 'giờ',
      description: 'Trông trẻ và chăm sóc người già',
      features: [
        'Trông trẻ từ 1-12 tuổi',
        'Cho trẻ ăn, tắm rửa',
        'Hỗ trợ học bài',
        'Chăm sóc người cao tuổi',
        'Hỗ trợ việc nhà nhẹ'
      ]
    }
  ];

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }
}
