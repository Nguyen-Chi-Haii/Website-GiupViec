import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content.service';

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
  templateUrl: './helper-jobs.component.html',
  styleUrl: './helper-jobs.component.css'
})
export class HelperJobsComponent implements OnInit {
  readonly contentService = inject(ContentService);

  // Default icons for requirements
  private readonly requirementIcons = ['person', 'location_city', 'school', 'verified_user'];
  
  // Default icons for benefits
  private readonly benefitIcons = ['payments', 'schedule', 'school', 'shield', 'trending_up', 'support_agent'];

  // Computed requirements from content service
  requirements = computed<Requirement[]>(() => {
    const content = this.contentService.jdContent();
    if (content.requirements.length > 0) {
      return content.requirements.map((req, index) => ({
        icon: this.requirementIcons[index % this.requirementIcons.length],
        title: req.split(',')[0] || req,
        description: req.split(',').slice(1).join(',').trim() || ''
      }));
    }
    // Fallback to defaults
    return [
      { icon: 'person', title: 'Độ tuổi 18-55', description: 'Có sức khỏe tốt, không mắc bệnh truyền nhiễm' },
      { icon: 'location_city', title: 'Cư trú ổn định', description: 'Có hộ khẩu hoặc KT3 tại TP.HCM hoặc tỉnh lân cận' },
      { icon: 'school', title: 'Biết đọc, viết', description: 'Tối thiểu tốt nghiệp tiểu học, giao tiếp tốt' },
      { icon: 'verified_user', title: 'Không tiền án tiền sự', description: 'Lý lịch trong sạch, trung thực và đáng tin cậy' }
    ];
  });

  // Computed benefits from content service
  benefits = computed<Benefit[]>(() => {
    const content = this.contentService.jdContent();
    if (content.benefits.length > 0) {
      return content.benefits.map((benefit, index) => ({
        icon: this.benefitIcons[index % this.benefitIcons.length],
        title: benefit
      }));
    }
    // Fallback to defaults
    return [
      { icon: 'payments', title: 'Lương cao, thanh toán đúng hạn' },
      { icon: 'schedule', title: 'Giờ làm việc linh hoạt' },
      { icon: 'school', title: 'Được đào tạo miễn phí' },
      { icon: 'shield', title: 'Có bảo hiểm tai nạn' },
      { icon: 'trending_up', title: 'Cơ hội thăng tiến' },
      { icon: 'support_agent', title: 'Hỗ trợ 24/7' }
    ];
  });

  // Computed documents from content service
  documents = computed<Document[]>(() => {
    const content = this.contentService.jdContent();
    if (content.documents.length > 0) {
      return content.documents.map(doc => {
        const isRequired = doc.toLowerCase().includes('bắt buộc');
        const name = doc.replace(/\s*-\s*Bắt buộc/i, '').trim();
        return { name, required: isRequired };
      });
    }
    // Fallback to defaults
    return [
      { name: 'CCCD/CMND (2 mặt, bản photo công chứng)', required: true },
      { name: 'Sơ yếu lý lịch có xác nhận địa phương', required: true },
      { name: 'Giấy khám sức khỏe (trong vòng 6 tháng)', required: true },
      { name: 'Hình thẻ 3x4 (2 tấm)', required: true },
      { name: 'Hộ khẩu hoặc KT3 (bản photo)', required: false },
      { name: 'Giấy xác nhận công việc cũ (nếu có)', required: false }
    ];
  });

  ngOnInit(): void {
    // Refresh content in case user just came from admin
    this.contentService.refreshContent();
  }

  // Format phone for tel: link (remove spaces)
  formatPhoneForTel(phone: string): string {
    return phone.replace(/\s/g, '');
  }
}
