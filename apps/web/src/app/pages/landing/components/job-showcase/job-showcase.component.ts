
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
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              @for (job of jobs(); track job.id) {
                <div class="job-card job-card-animate rounded-xl p-6 flex flex-col relative overflow-hidden bg-white dark:bg-[#1a2e27] dark:border-gray-700">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="job-icon-wrapper w-10 h-10 rounded-full flex items-center justify-center">
                      <span class="material-symbols-outlined">work</span>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-800 dark:text-white">{{ job.serviceName }}</h3>
                      <p class="text-xs text-gray-500 dark:text-gray-400">#{{ job.id }}</p>
                    </div>
                  </div>

                  <div class="space-y-2 mb-6 flex-1">
                    <div class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span class="material-symbols-outlined text-gray-400 text-lg">location_on</span>
                      <span class="truncate">{{ getCity(job.address) }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span class="material-symbols-outlined text-gray-400 text-lg">calendar_today</span>
                      <span>{{ job.startDate | date:'dd/MM/yyyy' }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                      <span class="material-symbols-outlined text-green-500 text-lg">payments</span>
                      <span>{{ job.totalPrice | currency:'VND':'symbol':'1.0-0' }}</span>
                    </div>
                  </div>

                  <a routerLink="/register" [queryParams]="{role: 'Helper'}" 
                     class="job-apply-btn block w-full py-2.5 text-center border border-green-500 text-green-600 dark:text-green-400 dark:border-green-400 rounded-lg font-medium transition-colors hover:bg-green-50 dark:hover:bg-green-900/20">
                    Nhận Việc
                  </a>
                </div>
              }
            </div>

            <div class="mt-10 text-center">
              <a routerLink="/register" [queryParams]="{role: 'Helper'}" 
                 class="cta-button inline-flex items-center gap-2 px-8 py-3 text-white rounded-full font-semibold shadow-lg">
                <span>Đăng Ký Làm Helper Ngay</span>
                <span class="material-symbols-outlined">arrow_forward</span>
              </a>
            </div>
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
        this.jobs.set(data.map(item => ({
            id: item.id,
            serviceName: item.serviceName || item.service?.name || 'Dịch vụ',
            address: item.address,
            startDate: item.startDate,
            totalPrice: item.totalPrice
        })));
        // this.jobs.set([]); // FORCE EMPTY FOR TESTING
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
}
