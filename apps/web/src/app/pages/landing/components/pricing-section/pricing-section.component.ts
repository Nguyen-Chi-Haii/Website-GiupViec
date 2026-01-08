import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServiceService } from '../../../../core/services/service.service';

interface PricingPlan {
  id: number;
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
  templateUrl: './pricing-section.component.html',
  styleUrl: './pricing-section.component.css'
})
export class PricingSectionComponent implements OnInit {
  private readonly serviceService = inject(ServiceService);

  pricingPlans = signal<PricingPlan[]>([]);
  isLoading = signal(true);

  // Icons mapping for services
  private readonly serviceIcons: Record<string, string> = {
    'dọn dẹp': 'mop',
    'vệ sinh': 'cleaning_services',
    'giặt': 'local_laundry_service',
    'chăm sóc': 'family_restroom',
    'nấu ăn': 'restaurant',
    'trông trẻ': 'child_care',
    'default': 'home_work'
  };

  // Default features based on service name
  private readonly defaultFeatures: Record<string, string[]> = {
    'default': [
      'Nhân viên được đào tạo chuyên nghiệp',
      'Có bảo hiểm tai nạn',
      'Hỗ trợ khách hàng 24/7',
      'Đổi lịch linh hoạt'
    ]
  };

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.serviceService.getAll().subscribe({
      next: (services) => {
        const activeServices = services.filter(s => s.isActive).slice(0, 3);
        
        const plans: PricingPlan[] = activeServices.map((service, index) => ({
          id: service.id,
          name: service.name,
          icon: service.icon || this.getIconForService(service.name),
          price: service.price,
          unit: service.unitLabel || 'giờ',
          description: service.description || this.getDescriptionForService(service.name),
          features: this.getFeaturesForService(service.name),
          isPopular: index === 0 // Mark first one as popular as per screenshot
        }));

        this.pricingPlans.set(plans);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading services:', err);
        // Use fallback default plans
        this.pricingPlans.set(this.getDefaultPlans());
        this.isLoading.set(false);
      }
    });
  }

  private getIconForService(serviceName: string): string {
    const nameLower = serviceName.toLowerCase();
    for (const [keyword, icon] of Object.entries(this.serviceIcons)) {
      if (nameLower.includes(keyword)) {
        return icon;
      }
    }
    return this.serviceIcons['default'];
  }

  private getDescriptionForService(serviceName: string): string {
    const nameLower = serviceName.toLowerCase();
    if (nameLower.includes('dọn dẹp') || nameLower.includes('vệ sinh')) {
      return 'Dịch vụ vệ sinh chuyên nghiệp cho gia đình';
    }
    if (nameLower.includes('giặt')) {
      return 'Giặt sạch với công nghệ hiện đại, an toàn';
    }
    if (nameLower.includes('chăm sóc') || nameLower.includes('trông trẻ')) {
      return 'Chăm sóc tận tâm, an toàn và chu đáo';
    }
    return 'Dịch vụ chất lượng cao với giá cả phải chăng';
  }

  private getFeaturesForService(serviceName: string): string[] {
    const nameLower = serviceName.toLowerCase();
    
    if (nameLower.includes('dọn dẹp')) {
      return ['Quét dọn, lau nhà', 'Dọn phòng ngủ, phòng khách', 'Vệ sinh nhà bếp', 'Đổ rác, sắp xếp đồ đạc'];
    }
    if (nameLower.includes('vệ sinh')) {
      return ['Vệ sinh sâu toàn bộ', 'Lau kính, cửa sổ', 'Vệ sinh nhà tắm, toilet', 'Vệ sinh máy lạnh'];
    }
    if (nameLower.includes('giặt')) {
      return ['Giặt sofa, nệm', 'Giặt rèm cửa', 'Diệt khuẩn bằng hơi nước', 'Khử mùi hiệu quả'];
    }
    if (nameLower.includes('chăm sóc')) {
      return ['Chăm sóc người già', 'Hỗ trợ sinh hoạt hàng ngày', 'Đo huyết áp, theo dõi sức khỏe', 'Đưa đón khi cần'];
    }
    if (nameLower.includes('trông trẻ')) {
      return ['Trông trẻ từ 1-12 tuổi', 'Cho trẻ ăn, tắm rửa', 'Hỗ trợ học bài', 'Chơi và giải trí cùng trẻ'];
    }
    
    return this.defaultFeatures['default'];
  }

  private getDefaultPlans(): PricingPlan[] {
    return [
      {
        id: 1,
        name: 'Dọn Dẹp Cơ Bản',
        icon: 'mop',
        price: 50000,
        unit: 'giờ',
        description: 'Dịch vụ dọn dẹp hàng ngày cho gia đình',
        features: ['Quét dọn, lau nhà', 'Dọn phòng ngủ, phòng khách', 'Vệ sinh nhà bếp cơ bản', 'Đổ rác, sắp xếp đồ đạc']
      },
      {
        id: 2,
        name: 'Dọn Dẹp Toàn Diện',
        icon: 'cleaning_services',
        price: 80000,
        unit: 'giờ',
        description: 'Dọn dẹp sâu, vệ sinh tổng thể',
        features: ['Tất cả dịch vụ cơ bản', 'Vệ sinh nhà tắm, toilet', 'Lau kính, cửa sổ', 'Giặt rèm, vệ sinh máy lạnh'],
        isPopular: true
      },
      {
        id: 3,
        name: 'Chăm Sóc Gia Đình',
        icon: 'family_restroom',
        price: 100000,
        unit: 'giờ',
        description: 'Trông trẻ và chăm sóc người già',
        features: ['Trông trẻ từ 1-12 tuổi', 'Cho trẻ ăn, tắm rửa', 'Hỗ trợ học bài', 'Chăm sóc người cao tuổi']
      }
    ];
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }
}
