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
  templateUrl: './content.component.html',
  styleUrl: './content.component.css'
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
