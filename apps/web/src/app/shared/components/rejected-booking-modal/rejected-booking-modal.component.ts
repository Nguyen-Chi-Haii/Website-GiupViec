import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingResponseDTO } from '@giupviec/shared';

@Component({
  selector: 'app-rejected-booking-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rejected-booking-modal.component.html',
  styleUrl: './rejected-booking-modal.component.css'
})
export class RejectedBookingModalComponent {
  @Input({ required: true }) bookings: BookingResponseDTO[] = [];
  @Output() dismissed = new EventEmitter<void>();

  close(): void {
    this.dismissed.emit();
  }
}
