import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RatingService } from '../../../core/services/rating.service';
import { BookingResponseDTO, RatingCreateDTO } from '@giupviec/shared';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Đơn Của Tôi</h2>
        <a routerLink="/booking" class="btn-primary">
          <span class="material-symbols-outlined">add</span>
          Đặt Dịch Vụ Mới
        </a>
      </div>

      <!-- Stats -->
      <div class="stats">
        <div class="stat">
          <span class="stat-value">{{ totalBookings() }}</span>
          <span class="stat-label">Tổng đơn</span>
        </div>
        <div class="stat">
          <span class="stat-value pending">{{ pendingBookings() }}</span>
          <span class="stat-label">Chờ xử lý</span>
        </div>
        <div class="stat">
          <span class="stat-value confirmed">{{ confirmedBookings() }}</span>
          <span class="stat-label">Đang thực hiện</span>
        </div>
        <div class="stat">
          <span class="stat-value completed">{{ completedBookings() }}</span>
          <span class="stat-label">Hoàn thành</span>
        </div>
        <div class="stat">
          <span class="stat-value cancelled">{{ cancelledBookings() }}</span>
          <span class="stat-label">Đã hủy</span>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading">Đang tải...</div>
      } @else if (bookings().length === 0) {
        <div class="empty-state">
          <span class="material-symbols-outlined">receipt_long</span>
          <h3>Chưa có đơn nào</h3>
          <p>Bạn chưa đặt dịch vụ nào. Hãy bắt đầu đặt ngay!</p>
          <a routerLink="/booking" class="btn-primary">Đặt Dịch Vụ</a>
        </div>
      } @else {
        <div class="bookings-list">
          @for (booking of bookings(); track booking.id) {
            <div class="booking-card" (click)="viewBooking(booking)">
              <div class="booking-header">
                <span class="booking-id">#{{ booking.id }}</span>
                <span class="status-badge" [class]="booking.status.toLowerCase()">
                  {{ getStatusLabel(booking.status) }}
                </span>
              </div>
              <h3>{{ booking.serviceName }}</h3>
              <div class="booking-info">
                <p>
                  <span class="material-symbols-outlined">calendar_month</span>
                  {{ booking.startDate | date:'dd/MM/yyyy' }}
                  @if (booking.startDate !== booking.endDate) {
                    - {{ booking.endDate | date:'dd/MM/yyyy' }}
                  }
                </p>
                <p>
                  <span class="material-symbols-outlined">schedule</span>
                  {{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}
                </p>
                <p>
                  <span class="material-symbols-outlined">location_on</span>
                  {{ booking.address }}
                </p>
                @if (booking.helperName) {
                  <p>
                    <span class="material-symbols-outlined">person</span>
                    {{ booking.helperName }}
                  </p>
                } @else {
                  <p class="no-helper">
                    <span class="material-symbols-outlined">person_search</span>
                    Chưa phân công người làm
                  </p>
                }
              </div>
              <div class="booking-footer">
                <div class="footer-left">
                  <span class="payment-badge" [class]="booking.paymentStatus.toLowerCase()">
                    {{ booking.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
                  </span>
                  <span class="price">{{ booking.totalPrice | number }}₫</span>
                </div>
                <div class="footer-actions">
                  @if (booking.status === 'Pending') {
                    <button class="btn-cancel" (click)="cancelBooking(booking); $event.stopPropagation()">Hủy đơn</button>
                  }
                  @if (booking.status === 'Completed' && !booking.isRated) {
                    <button class="btn-rate" (click)="openRatingModal(booking); $event.stopPropagation()">
                      <span class="material-symbols-outlined">star</span>
                      Đánh giá
                    </button>
                  }
                  @if (booking.status === 'Cancelled' || booking.status === 'Rejected') {
                    <button class="btn-reorder" (click)="reorderBooking(booking); $event.stopPropagation()">Đặt lại</button>
                  } @else if (booking.paymentStatus === 'Unpaid' && booking.status !== 'Completed' && booking.status !== 'Cancelled') {
                    <button class="btn-pay" [disabled]="payingBookingId() === booking.id" (click)="payBooking(booking.id); $event.stopPropagation()">
                      {{ payingBookingId() === booking.id ? 'Đang xử lý...' : 'Thanh toán' }}
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Detail Modal -->
      @if (selectedBooking()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Chi Tiết Đơn Hàng #{{ selectedBooking()!.id }}</h3>
              <button class="close-btn" (click)="closeModal()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Dịch vụ</label>
                  <p class="font-bold">{{ selectedBooking()!.serviceName }}</p>
                </div>
                <div class="detail-item">
                  <label>Người giúp việc</label>
                  <p>{{ selectedBooking()!.helperName || 'Đang tìm người...' }}</p>
                </div>
                <div class="detail-item full-width">
                  <label>Địa chỉ</label>
                  <p>{{ selectedBooking()!.address }}</p>
                </div>
                <div class="detail-item">
                  <label>Ngày bắt đầu</label>
                  <p>{{ selectedBooking()!.startDate | date:'dd/MM/yyyy' }}</p>
                </div>
                <div class="detail-item">
                  <label>Ngày kết thúc</label>
                  <p>{{ selectedBooking()!.endDate | date:'dd/MM/yyyy' }}</p>
                </div>
                <div class="detail-item">
                  <label>Thời gian</label>
                  <p>{{ formatTime(selectedBooking()!.startTime) }} - {{ formatTime(selectedBooking()!.endTime) }}</p>
                </div>
                <div class="detail-item">
                  <label>Trạng thái</label>
                  <p>
                    <span class="status-badge" [class]="selectedBooking()!.status.toLowerCase()">
                      {{ getStatusLabel(selectedBooking()!.status) }}
                    </span>
                  </p>
                </div>
                <div class="detail-item">
                  <label>Thanh toán</label>
                  <p>
                    <span class="payment-badge" [class]="selectedBooking()!.paymentStatus.toLowerCase()">
                      {{ selectedBooking()!.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
                    </span>
                  </p>
                </div>
                <div class="detail-item">
                  <label>Tổng tiền</label>
                  <p class="price-large">{{ selectedBooking()!.totalPrice | number }}₫</p>
                </div>
                @if (selectedBooking()!.notes) {
                  <div class="detail-item full-width">
                    <label>Ghi chú</label>
                    <p class="notes">{{ selectedBooking()!.notes }}</p>
                  </div>
                }
              </div>
            </div>
            @if (selectedBooking()!.status === 'Completed' && !selectedBooking()!.isRated) {
              <div class="modal-footer">
                <button class="btn-rate-large" (click)="openRatingModal(selectedBooking()!)">
                  <span class="material-symbols-outlined">star</span>
                  Đánh giá người giúp việc ngay
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Rating Modal -->
      @if (ratingBooking()) {
        <div class="modal-overlay" (click)="closeRatingModal()">
          <div class="modal rating-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Đánh giá dịch vụ</h3>
              <button class="close-btn" (click)="closeRatingModal()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="modal-body">
              <p class="rating-target">Bạn đang đánh giá đơn hàng <strong>#{{ ratingBooking()!.id }}</strong> - <strong>{{ ratingBooking()!.helperName }}</strong></p>
              
              <div class="star-rating">
                @for (star of [1,2,3,4,5]; track star) {
                  <span 
                    class="material-symbols-outlined star" 
                    [class.filled]="star <= currentScore()"
                    (click)="currentScore.set(star)"
                  >
                    star
                  </span>
                }
              </div>
              <p class="score-label">{{ getScoreLabel(currentScore()) }}</p>

              <div class="form-group">
                <label>Nhận xét của bạn (không bắt buộc)</label>
                <textarea 
                  [(ngModel)]="ratingComment" 
                  placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ và người giúp việc..."
                  rows="4"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-outline" (click)="closeRatingModal()">Bỏ qua</button>
              <button 
                class="btn-primary" 
                [disabled]="isSubmittingRating() || currentScore() === 0"
                (click)="submitRating()"
              >
                {{ isSubmittingRating() ? 'Đang gửi...' : 'Gửi đánh giá' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
    .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: #13b9a5; color: white; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { background: #0f9685; }
    .btn-primary:disabled { background: #ccc; cursor: not-allowed; }
    
    .stats { display: flex; gap: 1rem; flex-wrap: wrap; }
    .stat { background: white; border-radius: 12px; padding: 1rem 1.5rem; border: 1px solid #e5e7eb; text-align: center; min-width: 120px; }
    .stat-value { display: block; font-size: 1.5rem; font-weight: 700; color: #111817; }
    .stat-value.pending { color: #b45309; }
    .stat-value.confirmed { color: #1d4ed8; }
    .stat-value.completed { color: #16a34a; }
    .stat-value.cancelled { color: #6b7280; }
    .stat-label { font-size: 0.8rem; color: #638884; }
    
    .loading { padding: 3rem; text-align: center; color: #638884; }
    .empty-state { background: white; border-radius: 12px; padding: 3rem; text-align: center; border: 1px solid #e5e7eb; }
    .empty-state .material-symbols-outlined { font-size: 64px; color: #d1d5db; }
    .empty-state h3 { margin: 1rem 0 0.5rem; }
    .empty-state p { margin: 0 0 1.5rem; color: #638884; }
    
    .bookings-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
    .booking-card { background: white; border-radius: 12px; padding: 1.25rem; border: 1px solid #e5e7eb; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .booking-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    
    .booking-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .booking-id { font-weight: 600; color: #638884; }
    .status-badge { font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: 500; }
    .status-badge.pending { background: #fef3c7; color: #b45309; }
    .status-badge.confirmed { background: #dbeafe; color: #1d4ed8; }
    .status-badge.completed { background: #dcfce7; color: #16a34a; }
    .status-badge.cancelled, .status-badge.rejected { background: #f3f4f6; color: #6b7280; }
    
    .booking-card h3 { margin: 0 0 0.75rem; font-size: 1.1rem; }
    .booking-info p { margin: 0.25rem 0; font-size: 0.85rem; color: #638884; display: flex; align-items: center; gap: 0.5rem; }
    .booking-info .material-symbols-outlined { font-size: 18px; color: #13b9a5; }
    .booking-info .no-helper { color: #9ca3af; font-style: italic; }
    .booking-info .no-helper .material-symbols-outlined { color: #9ca3af; }
    
    .booking-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; flex-wrap: wrap; gap: 0.75rem; }
    .footer-left { display: flex; align-items: center; gap: 0.75rem; }
    .footer-actions { display: flex; gap: 0.5rem; }
    
    .payment-badge { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; }
    .payment-badge.paid { background: #dcfce7; color: #16a34a; }
    .payment-badge.unpaid { background: #fef2f2; color: #dc2626; }
    .price { font-size: 1.1rem; font-weight: 700; color: #13b9a5; }
    
    .btn-cancel { padding: 0.5rem 1rem; background: #f3f4f6; color: #6b7280; border: none; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
    .btn-cancel:hover { background: #e5e7eb; }
    .btn-pay { padding: 0.5rem 1rem; background: #13b9a5; color: white; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
    .btn-pay:hover { background: #0f9685; }
    .btn-reorder { padding: 0.5rem 1rem; background: #3b82f6; color: white; text-decoration: none; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
    .btn-reorder:hover { background: #2563eb; }
    
    .btn-rate { 
      padding: 0.5rem 1rem; background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; border-radius: 6px; 
      font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;
    }
    .btn-rate:hover { background: #ffedd5; }
    .btn-rate .material-symbols-outlined { font-size: 16px; }

    /* Modal Styles */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; backdrop-filter: blur(2px); }
    .modal { background: white; border-radius: 16px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f3f4f6; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #111817; }
    .close-btn { background: none; border: none; color: #6b7280; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
    .close-btn:hover { color: #111817; }
    .modal-body { padding: 1.5rem; flex: 1; }
    
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .detail-item label { display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #638884; margin-bottom: 0.25rem; letter-spacing: 0.025em; }
    .detail-item p { margin: 0; color: #111817; font-size: 1rem; }
    .detail-item.full-width { grid-column: span 2; }
    .font-bold { font-weight: 700; }
    .price-large { font-size: 1.25rem !important; font-weight: 800; color: #13b9a5; }
    .notes { font-style: italic; background: #f9fafa; padding: 0.75rem; border-radius: 8px; border-left: 3px solid #e5e7eb; }

    .modal-footer { padding: 1.25rem 1.5rem; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; gap: 0.75rem; }
    .btn-outline { padding: 0.75rem 1.25rem; background: white; border: 1px solid #e5e7eb; border-radius: 8px; font-weight: 600; cursor: pointer; color: #6b7280; }
    .btn-outline:hover { background: #f9fafb; color: #111817; }

    .btn-rate-large {
      width: 100%; padding: 1rem; background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; border-radius: 12px;
      font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;
    }
    .btn-rate-large:hover { background: #ffedd5; transform: scale(1.02); }

    /* Rating Modal Specific */
    .rating-modal { max-width: 450px; }
    .rating-target { text-align: center; color: #638884; margin-bottom: 1.5rem; }
    .star-rating { display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 0.5rem; }
    .star-rating .star { font-size: 48px; color: #e5e7eb; cursor: pointer; transition: transform 0.1s, color 0.1s; }
    .star-rating .star:hover { transform: scale(1.1); }
    .star-rating .star.filled { color: #f59e0b; }
    .score-label { text-align: center; font-weight: 700; color: #f59e0b; font-size: 1.1rem; margin-bottom: 1.5rem; min-height: 1.5rem; }
    
    .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
    textarea { width: 100%; border: 1px solid #e5e7eb; border-radius: 12px; padding: 0.75rem; font-family: inherit; resize: none; transition: border-color 0.2s; }
    textarea:focus { outline: none; border-color: #13b9a5; box-shadow: 0 0 0 3px rgba(19, 185, 165, 0.1); }
  `]
})
export class CustomerMyBookingsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly bookingState = inject(BookingStateService);
  private readonly notification = inject(NotificationService);
  private readonly ratingService = inject(RatingService);

  isLoading = signal(true);
  payingBookingId = signal<number | null>(null);
  bookings = signal<BookingResponseDTO[]>([]);
  selectedBooking = signal<BookingResponseDTO | null>(null);
  
  // Rating states
  ratingBooking = signal<BookingResponseDTO | null>(null);
  currentScore = signal(0);
  ratingComment = '';
  isSubmittingRating = signal(false);

  totalBookings = signal(0);
  pendingBookings = signal(0);
  confirmedBookings = signal(0);
  completedBookings = signal(0);
  cancelledBookings = signal(0);

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading.set(true);
    this.http.get<BookingResponseDTO[]>(`${environment.apiUrl}/bookings/my`).subscribe({
      next: (data) => {
        this.bookings.set(data);
        
        this.totalBookings.set(data.length);
        this.pendingBookings.set(data.filter(b => b.status === 'Pending').length);
        this.confirmedBookings.set(data.filter(b => b.status === 'Confirmed').length);
        this.completedBookings.set(data.filter(b => b.status === 'Completed').length);
        this.cancelledBookings.set(data.filter(b => b.status === 'Cancelled' || b.status === 'Rejected').length);
        
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error('Không thể tải danh sách đơn hàng');
      }
    });
  }

  viewBooking(booking: BookingResponseDTO): void {
    this.selectedBooking.set(booking);
  }

  closeModal(): void {
    this.selectedBooking.set(null);
  }

  openRatingModal(booking: BookingResponseDTO): void {
    this.ratingBooking.set(booking);
    this.currentScore.set(5); // Default to 5 stars
    this.ratingComment = '';
    this.selectedBooking.set(null); // Close detail modal if open
  }

  closeRatingModal(): void {
    this.ratingBooking.set(null);
    this.currentScore.set(0);
    this.ratingComment = '';
  }

  getScoreLabel(score: number): string {
    const labels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'];
    return labels[score] || '';
  }

  submitRating(): void {
    const booking = this.ratingBooking();
    if (!booking) return;

    this.isSubmittingRating.set(true);
    const dto: RatingCreateDTO = {
      bookingId: booking.id,
      score: this.currentScore(),
      comment: this.ratingComment
    };

    this.ratingService.createRating(dto).subscribe({
      next: () => {
        this.isSubmittingRating.set(false);
        this.notification.success('Cảm ơn bạn đã đánh giá dịch vụ!');
        this.closeRatingModal();
        this.loadBookings(); // Reload to update IsRated status
      },
      error: (err) => {
        this.isSubmittingRating.set(false);
        this.notification.error(err.error?.message || 'Có lỗi khi gửi đánh giá');
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'Pending': 'Chờ xử lý',
      'Confirmed': 'Đã xác nhận',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy',
      'Rejected': 'Từ chối'
    };
    return labels[status] || status;
  }

  formatTime(time: string): string {
    if (!time) return '';
    return time.substring(0, 5);
  }

  cancelBooking(booking: BookingResponseDTO): void {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    this.http.put(`${environment.apiUrl}/bookings/${booking.id}/status`, { status: 5 }).subscribe({
      next: () => {
        this.notification.success('Đã hủy đơn hàng thành công.');
        this.loadBookings();
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Có lỗi khi hủy đơn');
      }
    });
  }

  payBooking(bookingId: number): void {
    const confirmed = confirm(`Xác nhận thanh toán cho đơn hàng #${bookingId}?`);
    if (!confirmed) return;

    this.payingBookingId.set(bookingId);
    
    setTimeout(() => {
      this.http.put(`${environment.apiUrl}/bookings/${bookingId}/payment-confirm`, {}).subscribe({
        next: () => {
          this.payingBookingId.set(null);
          this.notification.success('Thanh toán thành công!');
          this.loadBookings();
        },
        error: (err) => {
          this.payingBookingId.set(null);
          this.notification.error('Thanh toán thất bại: ' + (err.error?.message || 'Lỗi hệ thống'));
        }
      });
    }, 1500);
  }

  reorderBooking(booking: BookingResponseDTO): void {
    this.bookingState.setReorderData({
      serviceId: booking.serviceId,
      serviceName: booking.serviceName,
      startDate: booking.startDate,
      endDate: booking.endDate,
      workShiftStart: booking.startTime,
      workShiftEnd: booking.endTime,
      address: booking.address,
      notes: booking.notes || undefined
    });
    
    this.router.navigate(['/booking/step1']);
  }
}
