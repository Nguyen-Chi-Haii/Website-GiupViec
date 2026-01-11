import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { ServiceService } from '../../../core/services/service.service';
import { AvailableJobFilterDTO } from '../../../core/models/booking-filter.dto';
import { BookingResponseDTO, ServiceResponse } from '@giupviec/shared';
import { ToastrService } from 'ngx-toastr';

import { VietnamProvincesService } from '../../../core/services/vietnam-provinces.service';
import { ProvinceResponse } from '../../../core/types/vietnam-provinces.types';

@Component({
  selector: 'app-available-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './available-jobs.component.html',
  styleUrl: './available-jobs.component.css'
})
export class AvailableJobsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private serviceService = inject(ServiceService);
  private provincesService = inject(VietnamProvincesService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  jobs = signal<BookingResponseDTO[]>([]);
  services = signal<ServiceResponse[]>([]);
  provinces = signal<ProvinceResponse[]>([]);
  isLoading = signal<boolean>(false);
  isProcessing = signal<boolean>(false);

  filter: AvailableJobFilterDTO = new AvailableJobFilterDTO();
  sortMode: string = 'newest';

  // Modal state
  showConfirmModal = false;
  jobToAccept: BookingResponseDTO | null = null;
  selectedJobId: number | null = null;

  ngOnInit(): void {
    this.loadServices();
    this.loadProvinces();
    this.loadJobs();
  }

  loadProvinces() {
    this.provincesService.getProvinces().subscribe({
      next: (res) => this.provinces.set(res),
      error: (err) => console.error('Error loading provinces:', err)
    });
  }

  loadServices() {
    this.serviceService.getAll().subscribe({
      next: (res: ServiceResponse[]) => this.services.set(res),
      error: (err: any) => console.error(err)
    });
  }

  loadJobs() {
    this.isLoading.set(true);
    this.bookingService.findAvailableJobs(this.filter).subscribe({
      next: (res: BookingResponseDTO[]) => {
        this.jobs.set(res);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.toastr.error('Không thể tải danh sách công việc', 'Lỗi');
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange() {
    this.filter.skip = 0; // Reset pagination logic if added later
    this.loadJobs();
  }

  onSortChange() {
    switch(this.sortMode) {
      case 'newest':
        this.filter.sortBy = 'date';
        this.filter.sortOrder = 'asc';
        break;
      case 'price_desc':
        this.filter.sortBy = 'price';
        this.filter.sortOrder = 'desc';
        break;
      case 'price_asc':
        this.filter.sortBy = 'price';
        this.filter.sortOrder = 'asc';
        break;
    }
    this.loadJobs();
  }

  confirmAccept(job: BookingResponseDTO) {
    this.jobToAccept = job;
    this.showConfirmModal = true;
  }

  closeModal() {
    this.showConfirmModal = false;
    this.jobToAccept = null;
  }

  onAccept() {
    if (!this.jobToAccept) return;
    
    this.isProcessing.set(true);
    this.selectedJobId = this.jobToAccept.id;

    this.bookingService.acceptJob(this.jobToAccept.id).subscribe({
      next: (res) => {
        this.toastr.success('Nhận việc thành công!', 'Chúc mừng');
        this.isProcessing.set(false);
        this.closeModal();
        this.loadJobs(); // Refresh list
        this.router.navigate(['/helper/schedule']);
      },
      error: (err) => {
        const msg = err.error?.message || 'Có lỗi xảy ra khi nhận việc';
        this.toastr.error(msg, 'Thất bại');
        this.isProcessing.set(false);
        this.closeModal();
      }
    });
  }
}
