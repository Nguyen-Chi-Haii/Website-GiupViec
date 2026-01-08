import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, BookingResponse } from '../../../core/services/admin.service';

@Component({
  selector: 'app-employee-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class EmployeeCalendarComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  
  bookings = signal<BookingResponse[]>([]);
  currentDate = signal(new Date());
  selectedBooking = signal<BookingResponse | null>(null);
  
  hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 to 22:00
  
  weekDays = computed(() => {
    const start = this.getStartOfWeek(this.currentDate());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  });

  weekRangeLabel = computed(() => {
    const days = this.weekDays();
    const first = days[0];
    const last = days[6];
    return `${first.getDate()}/${first.getMonth() + 1} - ${last.getDate()}/${last.getMonth() + 1}/${last.getFullYear()}`;
  });

  displayedDays = computed(() => {
    const allDays = this.weekDays();
    const allBookings = this.bookings();
    
    // Filter to only days that have at least one booking
    const filtered = allDays.filter(day => {
      const dayStr = this.formatLocalDate(day);
      return allBookings.some(b => {
        if (!b.startDate || !b.endDate) return false;
        const startStr = b.startDate.split('T')[0];
        const endStr = b.endDate.split('T')[0];
        return dayStr >= startStr && dayStr <= endStr && b.status !== 'Cancelled' && b.status !== 'Rejected';
      });
    });

    return filtered;
  });

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    const days = this.weekDays();
    const start = this.formatLocalDate(days[0]);
    const end = this.formatLocalDate(days[6]);
    
    this.adminService.getAllSchedules(start, end).subscribe({
      next: (data) => this.bookings.set(data),
      error: (err) => console.error('Error loading calendar data:', err)
    });
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getStartOfWeek(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  previousWeek(): void {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() - 7);
    this.currentDate.set(d);
    this.loadBookings();
  }

  nextWeek(): void {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() + 7);
    this.currentDate.set(d);
    this.loadBookings();
  }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.loadBookings();
  }

  isToday(d: Date): boolean {
    const today = new Date();
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear();
  }

  getBookingsForDay(day: Date): BookingResponse[] {
    const currentDayStr = this.formatLocalDate(day);

    return this.bookings().filter(b => {
      if (!b.startDate || !b.endDate) return false;
      
      const startStr = b.startDate.split('T')[0];
      const endStr = b.endDate.split('T')[0];

      const isInRange = currentDayStr >= startStr && currentDayStr <= endStr;
      const isActive = b.status !== 'Cancelled' && b.status !== 'Rejected';
      
      return isInRange && isActive;
    });
  }

  getEventTop(booking: BookingResponse): number {
    const [h, m] = (booking.startTime || '00:00').split(':').map(Number);
    // Offset by 8 hours (480 minutes) because the grid starts at 08:00
    return ((h * 60) + m) - 480;
  }

  getEventHeight(booking: BookingResponse): number {
    const [sh, sm] = (booking.startTime || '00:00').split(':').map(Number);
    const [eh, em] = (booking.endTime || '00:00').split(':').map(Number);
    const startMins = (sh * 60) + sm;
    const endMins = (eh * 60) + em;
    return Math.max(30, endMins - startMins);
  }

  getStatusClass(status: string): string {
    return (status || '').toLowerCase();
  }

  getProcessedBookingsForDay(day: Date): any[] {
    const dayBookings = this.getBookingsForDay(day);
    if (!dayBookings.length) return [];

    // 1. Sort by start time
    const sorted = [...dayBookings].sort((a, b) => {
      const aTime = a.startTime || '00:00';
      const bTime = b.startTime || '00:00';
      return aTime.localeCompare(bTime);
    });

    // 2. Assign to columns
    const columns: any[][] = [];
    const results: any[] = [];

    sorted.forEach(booking => {
      let assignedCol = -1;
      const bStart = booking.startTime || '00:00';

      for (let i = 0; i < columns.length; i++) {
        const lastInCol = columns[i][columns[i].length - 1];
        const lastEnd = lastInCol.endTime || '00:00';
        
        if (bStart >= lastEnd) {
          assignedCol = i;
          break;
        }
      }

      if (assignedCol === -1) {
        assignedCol = columns.length;
        columns.push([booking]);
      } else {
        columns[assignedCol].push(booking);
      }

      results.push({
        ...booking,
        colIndex: assignedCol
      });
    });

    // 3. Group into clusters to determine total columns needed for each group
    // A simplified approach: for each booking, find max concurrency it's part of
    const processed = results.map(b => {
      // Find all bookings that overlap with this one
      const overlapping = results.filter(other => {
        const bStart = b.startTime || '00:00';
        const bEnd = b.endTime || '00:00';
        const oStart = other.startTime || '00:00';
        const oEnd = other.endTime || '00:00';

        return (bStart < oEnd && bEnd > oStart);
      });

      // Find the maximum column index in this overlapping set
      // Actually, we need the total number of columns used by this group
      // This is a heuristic but works for most cases
      let groupMaxCol = Math.max(...overlapping.map(o => o.colIndex)) + 1;
      
      // Ensure we don't have gaps if we use groupMaxCol
      // For simplicity, let's use the total columns used in the day if they overlap
      // but that might be waste space. Let's use groupMaxCol for now.

      const width = 100 / groupMaxCol;
      const left = b.colIndex * width;

      return {
        ...b,
        uiWidth: width,
        uiLeft: left
      };
    });

    return processed;
  }

  viewBooking(booking: BookingResponse): void {
    this.selectedBooking.set(booking);
  }

  closeDetails(): void {
    this.selectedBooking.set(null);
  }
}
