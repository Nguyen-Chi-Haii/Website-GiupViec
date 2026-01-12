
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
    <section class="py-16 bg-gradient-to-br from-green-50 to-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-800 mb-4">Việc Làm Mới Nhất</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Hàng trăm công việc hấp dẫn đang chờ bạn. Đăng ký trở thành Người giúp việc ngay hôm nay để tăng thu nhập!
          </p>
        </div>

        @if (isLoading()) {
          <div class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (job of jobs(); track job.id) {
              <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <span class="material-symbols-outlined">work</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-800">{{ job.serviceName }}</h3>
                    <p class="text-xs text-gray-500">#{{ job.id }}</p>
                  </div>
                </div>

                <div class="space-y-2 mb-6 flex-1">
                  <div class="flex items-start gap-2 text-sm text-gray-600">
                    <span class="material-symbols-outlined text-gray-400 text-lg">location_on</span>
                    <span class="truncate">{{ getCity(job.address) }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <span class="material-symbols-outlined text-gray-400 text-lg">calendar_today</span>
                    <span>{{ job.startDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm font-medium text-green-600">
                    <span class="material-symbols-outlined text-green-500 text-lg">payments</span>
                    <span>{{ job.totalPrice | currency:'VND':'symbol':'1.0-0' }}</span>
                  </div>
                </div>

                <a routerLink="/auth/register" [queryParams]="{role: 'Helper'}" 
                   class="block w-full py-2.5 text-center bg-white border border-green-500 text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors">
                  Nhận Việc
                </a>
              </div>
            }
          </div>

          <div class="mt-10 text-center">
            <a routerLink="/auth/register" [queryParams]="{role: 'Helper'}" 
               class="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
              <span>Đăng Ký Làm Helper Ngay</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
  `]
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
