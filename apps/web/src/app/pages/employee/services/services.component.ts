import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, ServiceResponse } from '../../../core/services/admin.service';

@Component({
  selector: 'app-employee-services',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Danh Sách Dịch Vụ</h2>
        <p class="subtitle">Xem thông tin và giá cả các dịch vụ hiện có</p>
      </div>

      <div class="card">
        <div class="table-container">
          @if (isLoading()) {
            <div class="loading">Đang tải...</div>
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên dịch vụ</th>
                  <th>Đơn giá (VNĐ/giờ)</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                @for (service of services(); track service.id) {
                  <tr>
                    <td class="font-medium">#{{ service.id }}</td>
                    <td class="service-name">{{ service.name }}</td>
                    <td class="price">{{ service.price | number }}₫</td>
                    <td>
                      <span class="status-badge" [class.active]="service.isActive">
                        {{ service.isActive ? 'Đang kinh doanh' : 'Ngưng kinh doanh' }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="empty-state">Không có dịch vụ nào</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #111817; }
    .subtitle { margin: 0.5rem 0 0; color: #638884; }
    .card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .data-table th { text-align: left; padding: 1rem 1rem; background: #f6f8f8; color: #638884; font-weight: 500; font-size: 0.75rem; text-transform: uppercase; white-space: nowrap; }
    .data-table td { padding: 1rem 1rem; border-top: 1px solid #e5e7eb; color: #111817; }
    .data-table tr:hover { background: #f9fafb; }
    .font-medium { font-weight: 500; }
    .service-name { font-weight: 600; color: #13b9a5; }
    .price { font-weight: 700; }
    .status-badge { display: inline-flex; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; background: #f3f4f6; color: #6b7280; }
    .status-badge.active { background: #dcfce7; color: #16a34a; }
    .loading, .empty-state { padding: 3rem; text-align: center; color: #638884; }
  `]
})
export class EmployeeServicesComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  
  services = signal<ServiceResponse[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.adminService.getAllServices().subscribe({
      next: (data) => {
        this.services.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
