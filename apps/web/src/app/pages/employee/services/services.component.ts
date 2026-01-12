import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, ServiceResponse } from '../../../core/services/admin.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-employee-services',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class EmployeeServicesComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  
  services = signal<ServiceResponse[]>([]);
  isLoading = signal(true);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(1);
  totalItems = signal(0);

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading.set(true);
    this.adminService.getAllServices(this.currentPage(), this.pageSize()).subscribe({
      next: (result) => {
        this.services.set(result.items);
        this.totalPages.set(Math.ceil(result.totalCount / result.pageSize));
        this.totalItems.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadServices();
  }
}
