import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../../core/services/booking.service';
import { HelperService } from '../../../../core/services/helper.service';
import { AdminService } from '../../../../core/services/admin.service';
import { BookingResponseDTO } from '@giupviec/shared';
import { NotificationService } from '../../../../core/services/notification.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

interface AvailableHelper {
  id: number;
  fullName: string;
  email: string;
  ratingAverage: number;
}

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './pending-approvals.component.html',
  styleUrl: './pending-approvals.component.css'
})
export class PendingApprovalsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly notification = inject(NotificationService);
  private readonly helperService = inject(HelperService);
  private readonly adminService = inject(AdminService);

  bookings = signal<BookingResponseDTO[]>([]);
  filteredBookings = signal<BookingResponseDTO[]>([]);
  isLoading = signal(true);
  isProcessing = signal(false);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(1);
  totalItems = signal(0);

  // Filters
  statusFilter = '';
  
  // Modal state
  actionType: 'approve' | 'reject' | 'view' | 'assign' | null = null;
  selectedBooking: BookingResponseDTO | null = null;
  
  // Action data
  note: string = '';
  reason: string = '';
  
  // Assignment state
  availableHelpers = signal<AvailableHelper[]>([]);
  selectedHelperId = 0;
  isFetchingHelpers = signal(false);

  ngOnInit() {
    this.loadJobPosts();
  }

  loadJobPosts() {
    this.isLoading.set(true);
    
    const status = this.statusFilter;
    let approvalStatus: string | undefined;
    let jobStatus: string | undefined;

    if (status === 'pending_approval') {
      approvalStatus = 'Pending';
    } else if (status === 'hiring') {
      approvalStatus = 'Approved';
    } else if (status === 'cancelled') {
        // Map cancelled/rejected to status
        jobStatus = 'Cancelled';
    }

    this.bookingService.getJobPosts(this.currentPage(), this.pageSize(), approvalStatus, jobStatus).subscribe({
      next: (result) => {
        this.bookings.set(result.items);
        this.totalPages.set(Math.ceil(result.totalCount / result.pageSize));
        this.totalItems.set(result.totalCount);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading job posts:', err);
        this.notification.error('Lỗi tải danh sách bài đăng');
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadJobPosts();
  }

  applyFilters() {
    let filtered = this.bookings();
    
    // If filtering for 'hiring', exclude cancelled/rejected posts
    if (this.statusFilter === 'hiring') {
      filtered = filtered.filter(b => 
        b.status !== 'Cancelled' && 
        b.status !== 'Rejected'
      );
    }
    
    this.filteredBookings.set(filtered);
  }

  getJobStatus(booking: BookingResponseDTO): string {
    if (booking.approvalStatus === 'Pending') return 'pending_approval';
    if (booking.status === 'Rejected' || booking.status === 'Cancelled') return 'cancelled';
    
    // Check if expired (Approved but no helper and time passed)
    if (booking.approvalStatus === 'Approved' && !booking.helperId) {
        if (this.isExpired(booking)) return 'expired';
        return 'hiring';
    }
    
    return 'other';
  }

  isExpired(booking: BookingResponseDTO): boolean {
    if (!booking.startDate || !booking.startTime) return false;
    // Parse start date time
    const start = new Date(booking.startDate);
    const timeParts = booking.startTime.split(':');
    if (timeParts.length >= 2) {
        start.setHours(+timeParts[0], +timeParts[1], 0, 0);
    }
    return new Date() > start;
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadJobPosts();
  }

  getStatusClass(job: BookingResponseDTO): string {
    const status = this.getJobStatus(job);
    return status;
  }

  getStatusLabel(job: BookingResponseDTO): string {
    const status = this.getJobStatus(job);
    const labels: Record<string, string> = {
      'pending_approval': 'Chờ duyệt',
      'hiring': 'Đang tuyển',
      'cancelled': 'Đã hủy',
      'expired': 'Quá hạn'
    };
    return labels[status] || status;
  }

  openApproveModal(booking: BookingResponseDTO) {
    this.selectedBooking = booking;
    this.actionType = 'approve';
    this.note = '';
  }

  openRejectModal(booking: BookingResponseDTO) {
    this.selectedBooking = booking;
    this.actionType = 'reject';
    this.reason = '';
  }

  openDetailModal(booking: BookingResponseDTO) {
    this.selectedBooking = booking;
    this.actionType = 'view';
  }

  openAssignModal(booking: BookingResponseDTO) {
    this.selectedBooking = booking;
    this.actionType = 'assign';
    this.selectedHelperId = 0;
    this.loadAvailableHelpers(booking);
  }

  loadAvailableHelpers(booking: BookingResponseDTO) {
    this.isFetchingHelpers.set(true);
    this.helperService.getAvailableHelpers({
      serviceId: booking.serviceId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      workShiftStart: booking.startTime.includes(':') && booking.startTime.split(':').length === 2 ? `${booking.startTime}:00` : booking.startTime,
      workShiftEnd: booking.endTime.includes(':') && booking.endTime.split(':').length === 2 ? `${booking.endTime}:00` : booking.endTime
    }).subscribe({
      next: (helpers) => {
        this.availableHelpers.set(helpers.map(h => ({
          id: h.userId,
          fullName: h.fullName,
          email: '',
          ratingAverage: h.ratingAverage
        })));
        this.isFetchingHelpers.set(false);
      },
      error: (err) => {
        console.error('Error fetching available helpers:', err);
        this.notification.error('Không thể tải danh sách người giúp việc phù hợp');
        this.isFetchingHelpers.set(false);
      }
    });
  }

  assignHelper() {
    if (!this.selectedBooking || !this.selectedHelperId) return;
    this.isProcessing.set(true);

    this.adminService.assignHelper({
      bookingId: this.selectedBooking.id,
      helperId: this.selectedHelperId
    }).subscribe({
      next: () => {
        this.notification.success('Gán người giúp việc thành công!');
        this.finishAction();
      },
      error: (err) => {
        this.notification.error('Lỗi: ' + (err.error?.message || 'Không thể gán'));
        this.isProcessing.set(false);
      }
    });
  }

  closeModal() {
    this.actionType = null;
    this.selectedBooking = null;
    this.note = '';
    this.reason = '';
  }

  onApprove() {
    if (!this.selectedBooking) return;
    this.isProcessing.set(true);
    console.log('Approving booking:', this.selectedBooking.id, 'with note:', this.note);

    this.bookingService.approve(this.selectedBooking.id, this.note).subscribe({
      next: (res: any) => {
        console.log('Approve success:', res);
        this.notification.success('Đã duyệt đơn hàng thành công');
        this.finishAction();
      },
      error: (err: any) => {
         console.error('Approve error:', err);
         this.notification.error(err.error?.message || 'Có lỗi xảy ra khi phê duyệt');
         this.isProcessing.set(false);
      }
    });
  }

  onReject() {
    if (!this.selectedBooking || !this.reason) return;
    this.isProcessing.set(true);
    console.log('Rejecting booking:', this.selectedBooking.id, 'with reason:', this.reason);

    this.bookingService.reject(this.selectedBooking.id, this.reason).subscribe({
      next: (res: any) => {
         console.log('Reject success:', res);
         this.notification.info('Đã từ chối đơn hàng');
         this.finishAction();
      },
      error: (err: any) => {
         console.error('Reject error:', err);
         this.notification.error(err.error?.message || 'Có lỗi xảy ra khi từ chối');
         this.isProcessing.set(false);
      }
    });
  }

  private finishAction() {
    this.isProcessing.set(false);
    this.closeModal();
    this.loadJobPosts();
  }
}
