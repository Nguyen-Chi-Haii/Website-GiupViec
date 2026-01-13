
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface CheckJob {
  id: number;
  serviceName: string;
  address: string;
  startDate: string;
  totalPrice: number;
}

@Component({
  selector: 'app-job-showcase',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Việc Làm Mới Nhất</h2>
          <p class="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Hàng trăm công việc hấp dẫn đang chờ bạn. Đăng ký trở thành Người giúp việc ngay hôm nay để tăng thu nhập!
          </p>
        </div>

        @if (isLoading()) {
          <div class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        } @else {
          @if (jobs().length > 0) {
            
            @if (jobs().length > 5) {
              <!-- === MARQUEE LAYOUT (> 5 jobs) === -->
              <div class="marquee-container py-4">
                <div class="marquee-track">
                  <!-- Original List -->
                  @for (job of jobs(); track job.id) {
                    <ng-container *ngTemplateOutlet="jobCardTemplate; context: {$implicit: job}"></ng-container>
                  }
                  <!-- Duplicated List for Seamless Loop -->
                  @for (job of jobs(); track 'dup-' + job.id) {
                    <ng-container *ngTemplateOutlet="jobCardTemplate; context: {$implicit: job}"></ng-container>
                  }
                </div>
              </div>
            } @else {
              <!-- === STATIC LAYOUT (<= 5 jobs) === -->
              <div class="static-row">
                @for (job of jobs(); track job.id) {
                  <ng-container *ngTemplateOutlet="jobCardTemplate; context: {$implicit: job}"></ng-container>
                }
              </div>
            }

            <!-- Reusable Job Card Template -->
            <ng-template #jobCardTemplate let-job>
              <div class="premium-glass-card group flex-shrink-0 w-[90vw] md:w-[380px]">
                
                <!-- Header -->
                <div class="flex justify-between items-start mb-6 w-full">
                  <div class="premium-icon-box">
                    <span class="material-symbols-outlined">
                      {{ getServiceIcon(job.serviceName) }}
                    </span>
                  </div>
                  <span class="premium-badge">
                    #JOBS-{{ job.id }}
                  </span>
                </div>

                <!-- Title -->
                <h3 class="premium-title line-clamp-1">
                  {{ job.serviceName }}
                </h3>

                <!-- Details -->
                <div class="space-y-4 mb-8 flex-1 w-full">
                  <div class="premium-detail-row">
                    <span class="material-symbols-outlined text-lg">location_on</span>
                    <span class="truncate">{{ getCity(job.address) }}</span>
                  </div>
                  <div class="premium-detail-row">
                    <span class="material-symbols-outlined text-lg">calendar_today</span>
                    <span>{{ job.startDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="premium-detail-row">
                      <span class="material-symbols-outlined text-lg">verified_user</span>
                      <span>Đã xác thực</span>
                  </div>
                </div>

                <!-- Footer -->
                <div class="mt-auto w-full">
                  <div class="flex items-end justify-between mb-4 w-full">
                    <span class="text-xs font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">Thanh toán</span>
                    <span class="premium-price">
                      {{ job.totalPrice | currency:'VND':'symbol':'1.0-0' }}
                    </span>
                  </div>
                  
                  <a routerLink="/register" [queryParams]="{role: 'Helper'}" 
                      class="premium-btn">
                    <span>Nhận Việc Ngay</span>
                  </a>
                </div>
              </div>
            </ng-template>

          } @else {
            <div class="empty-state-card soft-glow-shadow wave-pattern">
              <!-- Decorative Globs -->
              <div class="decorative-blob blob-bottom-left"></div>
              <div class="decorative-blob blob-top-right"></div>

              <!-- 3D Style Illustration Container -->
              <div class="illustration-container z-10">
                <div class="illustration-glow"></div>
                <div class="illustration-image" 
                     style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuB6XdWPNFosbP7mFmeb_S90mXLh175GiKcy1GCA3Y80GwuaywcrGy2rLMX4LxWtPGTimP-ngjGAzXbEx1UpJerAINnyppX3ghmf3EdQ3R2S96I59dSP_iOcuUzkEuxYoBPp5IuARPCQ_dAha5vFGkc4mDAF51Eh2bZRvfpMYRgwku2rMgwGZ92BafRxBF5gcFVWyBiWOe5z7nNiN7W9hAV9POOFTlSmskF1SQAgq8p3uixW9QXQOUA9RWA6yZ6xTUg1KYocOf9uw7k');">
                  <div class="illustration-overlay"></div>
                </div>
              </div>

              <!-- Text Content -->
              <div class="flex max-w-[520px] flex-col items-center gap-4 text-center z-10">
                <h3 class="empty-title">
                  Bảng tin hiện đang vắng lặng
                </h3>
                <p class="empty-desc">
                  Cơ hội việc làm mới xuất hiện hàng ngày. Đăng ký ngay để là người đầu tiên biết khi có việc phù hợp với kỹ năng của bạn.
                </p>
              </div>

              <!-- CTA Section -->
              <div class="flex flex-col items-center gap-6 z-10">
                <a routerLink="/register" [queryParams]="{role: 'Helper'}" 
                   class="register-btn">
                  <span class="material-symbols-outlined">notifications_active</span>
                  <span class="truncate">Đăng Ký Nhận Thông Báo</span>
                </a>
                
                <a routerLink="/login" class="text-[#10b77f] text-sm font-semibold hover:underline underline-offset-4 transition-colors">
                  Đã có tài khoản? Đăng nhập ngay
                </a>
              </div>
            </div>
          }

        }
      </div>
    </section>
  `,
  styleUrl: './job-showcase.component.css'
})
export class JobShowcaseComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  
  jobs = signal<CheckJob[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.fetchJobs();
  }

  fetchJobs() {
    this.http.get<any[]>(`${this.apiUrl}/bookings/public/recent`).subscribe({
      next: (data) => {
        // Limit to 5 items as requested to maintain layout stability
        const limitedData = data.slice(0, 5);
        this.jobs.set(limitedData.map(item => ({
            id: item.id,
            serviceName: item.serviceName || item.service?.name || 'Dịch vụ',
            address: item.address,
            startDate: item.startDate,
            totalPrice: item.totalPrice
        })));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getCity(address: string): string {
    if (!address) return 'Toàn quốc';
    const parts = address.split(',');
    return parts[parts.length - 1].trim();
  }

  getServiceIcon(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('sofa')) return 'chair'; // sofa
    if (lower.includes('lạnh')) return 'ac_unit'; // máy lạnh
    if (lower.includes('dọn')) return 'cleaning_services'; // dọn dẹp
    if (lower.includes('phòng')) return 'corporate_fare'; // văn phòng
    if (lower.includes('khử')) return 'sanitizer'; // khử khuẩn
    return 'home_work'; // default
  }
}
