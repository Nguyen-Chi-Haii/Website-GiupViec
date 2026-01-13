import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BookingService } from '../../../core/services/booking.service';
import { BookingResponseDTO } from '@giupviec/shared';

import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-my-job-posts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  templateUrl: './my-job-posts.component.html',
  styleUrl: './my-job-posts.component.css'
})
export class CustomerMyJobPostsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly bookingState = inject(BookingStateService);
  private readonly notification = inject(NotificationService);
  private readonly chatService = inject(ChatService);

  isLoading = signal(true);
  jobPosts = signal<BookingResponseDTO[]>([]);
  selectedJob = signal<BookingResponseDTO | null>(null);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(1);
  totalItems = signal(0);
  
  // Filter state
  selectedFilter = signal<string>('hiring'); // Mặc định: Đang tuyển người
  
  // Computed filtered posts - now just returning jobPosts because server does the filtering
  filteredJobPosts = computed(() => this.jobPosts());

  ngOnInit(): void {
    console.log('[MyJobPosts] Component initialized');
    this.loadJobPosts();

    // Listen to real-time updates
    this.chatService.notification$.subscribe((noti: any) => {
      if (noti.relatedEntityType === 'Booking') {
        // Refresh list if status changes
        if (['BookingApproved', 'BookingRejected', 'BookingAccepted', 'BookingCancelled'].includes(noti.type)) {
           this.loadJobPosts();
        }
      }
    });
  }

  loadJobPosts(): void {
    this.isLoading.set(true);
    
    const filter = this.selectedFilter();
    let approvalStatus: string | undefined;
    let status: string | undefined;

    if (filter === 'pending') {
      approvalStatus = 'Pending';
    } else if (filter === 'hiring') {
      approvalStatus = 'Approved';
      status = 'Pending';
    } else if (filter === 'cancelled') {
        // Map cancelled/rejected to status
        status = 'Cancelled';
    }

    this.bookingService.getMyBookings(this.currentPage(), this.pageSize(), status, true, approvalStatus).subscribe({
      next: (result) => {
        this.jobPosts.set(result.items);
        this.totalPages.set(Math.ceil(result.totalCount / result.pageSize));
        this.totalItems.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('[MyJobPosts] API Error:', err);
        this.isLoading.set(false);
        this.notification.error('Không thể tải danh sách bài đăng');
      }
    });
  }

  viewJob(job: BookingResponseDTO): void {
    this.selectedJob.set(job);
  }

  closeModal(): void {
    this.selectedJob.set(null);
  }

  getStatusLabel(job: BookingResponseDTO): string {
    if (job.status === 'Cancelled') return 'Đã gỡ bài';
    
    switch (job.approvalStatus) {
      case 'Pending': return 'Đang chờ duyệt';
      case 'Approved': return 'Đang tìm người';
      case 'Rejected': return 'Bị từ chối';
      default: return job.status;
    }
  }

  getStatusClass(job: BookingResponseDTO): string {
    if (job.status === 'Cancelled') return 'status-cancelled';
    
    switch (job.approvalStatus) {
      case 'Pending': return 'status-pending';
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  }

  formatTime(time: string): string {
    if (!time) return '';
    return time.substring(0, 5);
  }

  cancelJob(job: BookingResponseDTO): void {
    if (!confirm('Bạn có chắc muốn gỡ bài đăng này?')) return;

    this.bookingService.cancelByCustomer(job.id).subscribe({
      next: () => {
        this.notification.success('Đã gỡ bài đăng thành công');
        this.loadJobPosts();
        this.closeModal();
      },
      error: (err: any) => {
        this.notification.error(err.error?.message || 'Có lỗi khi gỡ bài');
      }
    });
  }

  setFilter(filter: string): void {
    this.selectedFilter.set(filter);
    this.currentPage.set(1);
    this.loadJobPosts();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadJobPosts();
  }

  getJobStatus(job: BookingResponseDTO): string {
    // Pending approval
    if (job.approvalStatus === 'Pending') return 'pending';
    
    // Hiring (approved but no helper)
    if (job.approvalStatus === 'Approved' && !job.helperId) return 'hiring';
    
    // Cancelled or Rejected
    if (job.status === 'Cancelled' || job.status === 'Rejected') return 'cancelled';
    
    return 'other';
  }
}
