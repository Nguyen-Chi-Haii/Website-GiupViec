import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../../../core/services/booking.service';
import { BookingResponseDTO } from '@giupviec/shared';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-jobs.component.html',
  styleUrl: './my-jobs.component.css'
})
export class MyJobsComponent implements OnInit {
  bookingService = inject(BookingService);
  toastr = inject(ToastrService);

  jobs = signal<BookingResponseDTO[]>([]);
  isLoading = signal<boolean>(false);
  selectedJob = signal<BookingResponseDTO | null>(null);
  
  // Status filters
  statuses = ['All', 'Confirmed', 'Completed', 'Cancelled'];
  selectedStatus = signal<string>('Confirmed'); // Mặc định: Đang thực hiện

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.isLoading.set(true);
    const status = this.selectedStatus();
    
    this.bookingService.getHelperJobs(status).subscribe({
      next: (data) => {
        this.jobs.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading jobs', err);
        this.toastr.error('Không thể tải danh sách công việc');
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(status: string) {
    this.selectedStatus.set(status);
    this.loadJobs();
  }

  confirmCompletion(id: number) {
    if (!confirm('Xác nhận đã hoàn thành công việc này?')) return;
    
    this.bookingService.confirmByHelper(id).subscribe({
      next: () => {
        this.toastr.success('Xác nhận hoàn thành thành công!');
        this.loadJobs();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Có lỗi xảy ra');
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusColorClass(status: string): string {
    switch (status) {
      case 'Confirmed': return 'confirmed';
      case 'Completed': return 'completed';
      case 'Cancelled': return 'cancelled';
      case 'Pending': return 'pending';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Confirmed': return 'Đang thực hiện';
      case 'Completed': return 'Hoàn thành';
      case 'Cancelled': return 'Đã hủy';
      case 'Pending': return 'Chờ duyệt'; 
      default: return status;
    }
  }

  openDetailModal(job: BookingResponseDTO): void {
    this.selectedJob.set(job);
  }

  closeDetailModal(): void {
    this.selectedJob.set(null);
  }

  canComplete(job: BookingResponseDTO): boolean {
    if (job.status !== 'Confirmed') return false;
    
    const now = new Date();
    const endDate = new Date(job.endDate);
    
    // Parse end time (HH:mm)
    const [hours, minutes] = job.endTime.split(':').map(Number);
    
    // Set time for end date
    const jobEndTime = new Date(endDate);
    jobEndTime.setHours(hours, minutes, 0, 0);

    return now >= jobEndTime;
  }
}
