import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { BookingResponseDTO } from '@giupviec/shared';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class CustomerDashboardComponent implements OnInit {
  private bookingService = inject(BookingService);
  public authService = inject(AuthService);

  bookings = signal<BookingResponseDTO[]>([]);
  isLoading = signal(true);

  // Stats computed
  stats = computed(() => {
    const list = this.bookings();
    
    // Status Logic:
    // Active: Confirmed
    // Pending: Pending & ApprovalStatus == Pending
    // Completed: Completed
    
    const activeBookings = list.filter(b => b.status === 'Confirmed');
    const pendingApproval = list.filter(b => b.status === 'Pending'); // Includes both pending approval and pending helper? Used to be.
    // If unified flow: 'Pending' usually means waiting for Helper OR waiting for Approval?
    // Let's count 'Pending' generally as "waiting"
    
    const completed = list.filter(b => b.status === 'Completed');
    
    return {
      active: activeBookings.length,
      pending: pendingApproval.length,
      completed: completed.length
    };
  });

  nextService = computed(() => {
    const list = this.bookings();
    const now = new Date();
    
    // Filter Confirmed or Pending (if they want to see pending ones? Usually next confirmed service)
    const upcoming = list.filter(b => b.status === 'Confirmed');
    
    // Sort by Date ASC
    const sorted = [...upcoming].sort((a, b) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateA - dateB;
    });

    // Find first one >= today
    // Note: startDate string "YYYY-MM-DD"
    // We want the most imminent one.
    // Since API usually returns all, we might need to filter out past ones more strictly?
    // Doing strict check:
    const future = sorted.filter(b => {
        const d = new Date(b.startDate);
        // Add end time to be precise? Or just day?
        // Let's assume day >= today is good enough
        d.setHours(23, 59, 59);
        return d >= now;
    });

    return future[0] || null;
  });

  recentActivity = computed(() => {
    // Show recent 5 bookings (by creation date or action?)
    // Using createdDate if available, or just ID descending as proxy
    return [...this.bookings()]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.bookingService.getMyBookings(1, 10, 'All', false).subscribe({
      next: (result) => {
        this.bookings.set(result.items);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'Pending': 'Chờ xử lý',
      'Confirmed': 'Đang thực hiện',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy',
      'Rejected': 'Bị từ chối'
    };
    return labels[status] || status;
  }
}
