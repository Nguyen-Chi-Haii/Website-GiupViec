import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Interfaces matching admin content management
export interface LandingContent {
  heroTitle: string;
  heroSubtitle: string;
  heroBannerUrl: string;
  statsCustomers: string;
}

export interface JDContent {
  email: string;
  hotline: string;
  salaryRange: string;
  requirements: string[];
  benefits: string[];
  documents: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private readonly platformId = inject(PLATFORM_ID);

  // Default landing content
  private readonly defaultLandingContent: LandingContent = {
    heroTitle: 'Giúp Việc Nhà - Dịch Vụ Tin Cậy Cho Gia Đình Bạn',
    heroSubtitle: 'Giải pháp vệ sinh toàn diện, chuyên nghiệp và tận tâm. Chúng tôi mang đến không gian sống sạch sẽ, an lành với mức giá minh bạch nhất.',
    heroBannerUrl: '',
    statsCustomers: '10,000+'
  };

  // Default JD content
  private readonly defaultJDContent: JDContent = {
    email: 'tuyendung@giupviecnha.vn',
    hotline: '0901 234 567',
    salaryRange: '50K - 100K/giờ',
    requirements: [
      'Độ tuổi 18-55, sức khỏe tốt',
      'Cư trú ổn định tại TP.HCM',
      'Biết đọc, viết cơ bản',
      'Không có tiền án tiền sự'
    ],
    benefits: [
      'Lương cao, thanh toán đúng hạn',
      'Giờ làm việc linh hoạt',
      'Được đào tạo miễn phí',
      'Có bảo hiểm tai nạn'
    ],
    documents: [
      'CCCD/CMND (2 mặt, bản photo công chứng) - Bắt buộc',
      'Sơ yếu lý lịch có xác nhận địa phương - Bắt buộc',
      'Giấy khám sức khỏe (trong vòng 6 tháng) - Bắt buộc',
      'Hình thẻ 3x4 (2 tấm) - Bắt buộc',
      'Hộ khẩu hoặc KT3 (bản photo)',
      'Giấy xác nhận công việc cũ (nếu có)'
    ]
  };

  // Signals for reactive content
  landingContent = signal<LandingContent>(this.defaultLandingContent);
  jdContent = signal<JDContent>(this.defaultJDContent);

  constructor() {
    this.loadContent();
  }

  /**
   * Load content from localStorage
   */
  loadContent(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Load landing content
    const savedLanding = localStorage.getItem('admin_landing_content');
    if (savedLanding) {
      try {
        const parsed = JSON.parse(savedLanding);
        this.landingContent.set({ ...this.defaultLandingContent, ...parsed });
      } catch {
        console.warn('Failed to parse landing content from localStorage');
      }
    }

    // Load JD content
    const savedJD = localStorage.getItem('admin_jd_content');
    if (savedJD) {
      try {
        const parsed = JSON.parse(savedJD);
        this.jdContent.set({ ...this.defaultJDContent, ...parsed });
      } catch {
        console.warn('Failed to parse JD content from localStorage');
      }
    }
  }

  /**
   * Refresh content from localStorage (useful when returning from admin)
   */
  refreshContent(): void {
    this.loadContent();
  }
}
