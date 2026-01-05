import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, BookingResponse } from '../../../core/services/admin.service';

@Component({
  selector: 'app-employee-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Lịch Vận Hành</h2>
        <div class="header-actions">
          <button class="btn-icon" (click)="previousWeek()">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <span class="current-range">{{ weekRangeLabel() }}</span>
          <button class="btn-icon" (click)="nextWeek()">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
          <button class="btn-outline" (click)="goToToday()">Hôm nay</button>
        </div>
      </div>

      <div class="calendar-card">
        <div class="calendar-grid">
          <!-- Calendar Header (Days) -->
          <div class="grid-header">
            <div class="time-column">Giờ</div>
            @for (day of weekDays(); track day) {
              <div class="header-day" [class.today]="isToday(day)">
                <span class="day-name">{{ day | date:'EEEE' }}</span>
                <span class="day-date">{{ day | date:'dd/MM' }}</span>
              </div>
            }
          </div>

          <!-- Calendar Body -->
          <div class="grid-body">
             <!-- Time Slots (Left) -->
             <div class="time-slots">
                @for (hour of hours; track hour) {
                  <div class="time-slot">{{ hour }}:00</div>
                }
             </div>

             <!-- Grid Cells/Events -->
             <div class="grid-container">
                @for (day of weekDays(); track day) {
                  <div class="day-column">
                    @for (hour of hours; track hour) {
                      <div class="cell"></div>
                    }
                    <!-- Events Overlay -->
                     @for (booking of getBookingsForDay(day); track booking.id) {
                      <div class="event" 
                           [style.top.px]="getEventTop(booking)" 
                           [style.height.px]="getEventHeight(booking)"
                           [class]="getStatusClass(booking.status)"
                           (click)="viewBooking(booking)">
                        <div class="event-time">{{ (booking.startTime || '') | slice:0:5 }} - {{ (booking.endTime || '') | slice:0:5 }}</div>
                        <div class="event-title">{{ booking.serviceName }}</div>
                        <div class="event-helper">{{ booking.helperName || 'Chưa gán' }}</div>
                        <div class="event-customer" style="font-size: 0.65rem; opacity: 0.8;">{{ booking.customerName }}</div>
                      </div>
                    }
                  </div>
                }
             </div>
          </div>
        </div>
      </div>

       <!-- Simple Details Overlay -->
       @if (selectedBooking()) {
        <div class="modal-overlay" (click)="closeDetails()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Chi tiết đơn hàng #{{ selectedBooking()?.id }}</h3>
              <button class="close-btn" (click)="closeDetails()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="info-row">
                <span class="label">Khách hàng:</span>
                <span class="value">{{ selectedBooking()?.customerName }}</span>
              </div>
              <div class="info-row">
                <span class="label">Dịch vụ:</span>
                <span class="value">{{ selectedBooking()?.serviceName }}</span>
              </div>
              <div class="info-row">
                <span class="label">Thời gian:</span>
                <span class="value">{{ selectedBooking()?.startTime }} - {{ selectedBooking()?.endTime }}</span>
              </div>
              <div class="info-row">
                <span class="label">Ngày:</span>
                <span class="value">{{ selectedBooking()?.startDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Người làm:</span>
                <span class="value">{{ selectedBooking()?.helperName || 'Chưa gán' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Địa chỉ:</span>
                <span class="value">{{ selectedBooking()?.address }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1rem; height: 100%; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .header-actions { display: flex; align-items: center; gap: 1rem; }
    .current-range { font-weight: 600; min-width: 150px; text-align: center; }
    .btn-icon { background: none; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; display: flex; align-items: center; padding: 4px; }
    .btn-outline { padding: 0.5rem 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; }

    .calendar-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .calendar-grid { display: flex; flex-direction: column; height: 800px; overflow-y: auto; }

    .grid-header { display: flex; border-bottom: 1px solid #e5e7eb; background: #f9fafb; position: sticky; top: 0; z-index: 10; }
    .time-column { width: 60px; flex-shrink: 0; border-right: 1px solid #e5e7eb; }
    .header-day { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 0.75rem 0; border-right: 1px solid #e5e7eb; }
    .header-day:last-child { border-right: none; }
    .header-day.today { background: rgba(19, 185, 165, 0.05); color: #13b9a5; }
    .day-name { font-size: 0.75rem; font-weight: 500; text-transform: uppercase; color: #6b7280; }
    .today .day-name { color: #13b9a5; }
    .day-date { font-size: 1.1rem; font-weight: 700; }

    .grid-body { display: flex; position: relative; }
    .time-slots { width: 60px; flex-shrink: 0; border-right: 1px solid #e5e7eb; background: #f9fafb; }
    .time-slot { height: 60px; font-size: 0.7rem; color: #6b7280; text-align: center; padding-top: 5px; border-bottom: 1px solid #f3f4f6; }
    
    .grid-container { flex: 1; display: flex; position: relative; }
    .cell { height: 60px; border-bottom: 1px solid #f3f4f6; border-right: 1px solid #f3f4f6; }
    .day-column { flex: 1; min-width: 120px; position: relative; height: 1440px; border-right: 1px solid #e5e7eb; } /* 24 hours * 60px */

    .event {
      position: absolute;
      left: 2px;
      right: 2px;
      background: #e0f2f1;
      border-left: 4px solid #13b9a5;
      padding: 4px;
      border-radius: 4px;
      font-size: 0.7rem;
      overflow: hidden;
      cursor: pointer;
      z-index: 1;
      transition: all 0.2s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .event:hover { transform: scale(1.02); z-index: 2; }
    .event-time { font-weight: 700; margin-bottom: 2px; }
    .event-title { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .event-helper { color: #638884; font-size: 0.7rem; }

    .event.pending { border-left-color: #f59e0b; background: #fffbeb; }
    .event.confirmed { border-left-color: #3b82f6; background: #eff6ff; }
    .event.completed { border-left-color: #10b981; background: #ecfdf5; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #1e2a2a; border-radius: 12px; width: 400px; color: white; padding: 1.5rem; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .info-row { display: flex; margin-bottom: 0.5rem; font-size: 0.9rem; }
    .info-row .label { width: 100px; color: #9ca3af; flex-shrink: 0; }
    .close-btn { background: none; border: none; color: #9ca3af; cursor: pointer; }
  `]
})
export class EmployeeCalendarComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  
  bookings = signal<BookingResponse[]>([]);
  currentDate = signal(new Date());
  selectedBooking = signal<BookingResponse | null>(null);
  
  hours = Array.from({ length: 24 }, (_, i) => i);
  
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
    return (h * 60) + m;
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

  viewBooking(booking: BookingResponse): void {
    this.selectedBooking.set(booking);
  }

  closeDetails(): void {
    this.selectedBooking.set(null);
  }
}
