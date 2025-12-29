import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceService } from '../../../../core/services/service.service';
import { ServiceResponse } from '../../../../core/models/service.model';

interface DisplayService {
  id: number;
  name: string;
  description: string;
  price: string;
  unit: string;
  image: string;
  badge?: string;
}

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services-section.component.html',
  styleUrl: './services-section.component.css'
})
export class ServicesSectionComponent implements OnInit {
  private readonly serviceService = inject(ServiceService);
  
  services = signal<DisplayService[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Default services for display (fallback or enhancement)
  private readonly defaultServices: DisplayService[] = [
    {
      id: 1,
      name: 'Dọn Dẹp Nhà Cửa',
      description: 'Vệ sinh phòng khách, phòng ngủ, bếp, toilet. Lau bụi, quét dọn, sắp xếp đồ đạc gọn gàng.',
      price: '60.000đ',
      unit: '/giờ',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAR2MsqoJPN_CGNcRg0CP5cM1wPNVviQsdyCVe_QXFH7TVjBPAXCWn4ISOxVNi3lhIgxdm3TxeS5lV0uKuEmzcgFCaR1re6oBeDcgE7biW2ZfK6vtWtJNQM0s51Ki3P_RKNohmbqNMkj5G6k2mc5-hwU7JtbNG3IIrXrmcRIBXYMx1At9xglZI6PJgYnAUEhG5nI77Yxvtq3njQSe1Lhj_4tc0GiXZEY-2fLd2HB19suxH5yeF8fUieZ7wOKFCh_opVzS1bDAt4kAU',
      badge: 'Phổ biến'
    },
    {
      id: 2,
      name: 'Tổng Vệ Sinh',
      description: 'Làm sạch sâu toàn bộ ngôi nhà, bao gồm cửa kính, trần nhà, và các góc khuất khó vệ sinh.',
      price: '15.000đ',
      unit: '/m2',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXGGJ_pP_rcA78XeVyCoOF-kXVhk0UHLvdaVKa5-nGp8lqZ0bFU9fsG2NU2iW7GFtI9gLkGmGUrittVBJYqOMnoqLwuexwBQ_DHRwT2heUoDi9VXaXOuPMI3vrVH8XLIUmiZSD11JMESF8-8LCE4GpegrEZ2ARDuqiG-6OaMM42BVQwagWru9hVN6zF2hL07GYFrVHKkCxKclsmWpKHzOZt3JUewtenxLoAigWweQL4k5YyEIdPylBU1pO1uwHqTsulrRIoYpOmJs'
    },
    {
      id: 3,
      name: 'Giặt Sofa & Rèm',
      description: 'Giặt sạch sofa nỉ, da, nệm, rèm cửa tại nhà với công nghệ hơi nước nóng diệt khuẩn.',
      price: '300.000đ',
      unit: '/bộ',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBO379YMuN6xxRHMCUP-dAzDH0EkzF4DEsDjCehAHbGKwcQSzfYP9blpRASwpu9N33tmyPOnrtRMBU3VEzN0d5-NYCmpN0McmrU8NnSTCmWatXWSBZ_GfVseyCPJqfRyp1mH2puSoFU0KZ9MlsJ0-U76Bw1SR376mTjEdSVMAof2D3zHdwT81XIgy3lHRUi9acl9CwJ8qixBx8RO6PYf1U0SaOvb6NLZ-0sLu7ylT9CmHTxit-X0aBzB_VEbLkl_6grZxUb8Gw6CeM'
    }
  ];

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.serviceService.getAll().subscribe({
      next: (apiServices) => {
        // Merge API data with default display data
        const displayServices = this.defaultServices.map((defaultSvc, index) => {
          const apiSvc = apiServices[index];
          if (apiSvc) {
            return {
              ...defaultSvc,
              id: apiSvc.id,
              name: apiSvc.name,
              price: this.formatPrice(apiSvc.price),
            };
          }
          return defaultSvc;
        });
        this.services.set(displayServices);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading services:', err);
        // Fallback to default services
        this.services.set(this.defaultServices);
        this.isLoading.set(false);
      }
    });
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }
}
