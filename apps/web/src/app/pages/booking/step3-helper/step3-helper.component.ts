import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { HelperService } from '../../../core/services/helper.service';
import { HelperSuggestion } from '@giupviec/shared';

@Component({
  selector: 'app-booking-step3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step3-helper.component.html',
  styleUrl: './step3-helper.component.css'
})
export class BookingStep3Component implements OnInit {
  private readonly bookingState = inject(BookingStateService);
  private readonly helperService = inject(HelperService);
  private readonly router = inject(Router);

  helpers = signal<HelperSuggestion[]>([]);
  isLoading = signal(true);
  selectedHelperId = signal<number | null>(null);
  autoAssign = signal(true);

  ngOnInit(): void {
    this.bookingState.setCurrentStep(3);

    // Check prerequisites
    if (!this.bookingState.canProceedToStep3()) {
      this.router.navigate(['/booking/step2']);
      return;
    }

    // Restore previous selection
    const prevHelper = this.bookingState.selectedHelper();
    if (prevHelper) {
      this.selectedHelperId.set(prevHelper.userId);
      this.autoAssign.set(false);
    }
    this.autoAssign.set(this.bookingState.autoAssignHelper());

    this.loadHelpers();
  }

  private loadHelpers(): void {
    const address = this.bookingState.address();
    const schedule = this.bookingState.schedule();

    if (!address || !schedule) {
      this.isLoading.set(false);
      return;
    }

    // Call API to get available helpers
    this.helperService.getAvailableHelpers({
      serviceId: this.bookingState.selectedService()?.id ?? 0,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      workShiftStart: schedule.workShiftStart,
      workShiftEnd: schedule.workShiftEnd
    }).subscribe({
      next: (helpers: HelperSuggestion[]) => {
        this.helpers.set(helpers);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        console.error('Error loading helpers:', err);
        // Fallback data
        this.helpers.set([
          { id: 1, userId: 1, fullName: 'Nguyễn Thị Lan', avatar: '', ratingAverage: 4.9, ratingCount: 120, experienceYears: 3, activeArea: 'TP. Hồ Chí Minh', bio: '', hourlyRate: 50000 },
          { id: 2, userId: 2, fullName: 'Trần Văn Minh', avatar: '', ratingAverage: 4.8, ratingCount: 85, experienceYears: 5, activeArea: 'TP. Hồ Chí Minh', bio: '', hourlyRate: 60000 },
          { id: 3, userId: 3, fullName: 'Lê Thị Hương', avatar: '', ratingAverage: 4.7, ratingCount: 42, experienceYears: 2, activeArea: 'Hà Nội', bio: '', hourlyRate: 45000 }
        ]);
        this.isLoading.set(false);
      }
    });
  }

  get selectedService() {
    return this.bookingState.selectedService();
  }

  get schedule() {
    return this.bookingState.schedule();
  }

  toggleAutoAssign(value: boolean): void {
    this.autoAssign.set(value);
    if (value) {
      this.selectedHelperId.set(null);
      this.bookingState.setAutoAssignHelper(true);
    } else {
      this.bookingState.setAutoAssignHelper(false);
    }
  }

  selectHelper(helper: HelperSuggestion): void {
    this.autoAssign.set(false);
    this.selectedHelperId.set(helper.userId);
    this.bookingState.setSelectedHelper(helper);
  }

  isSelected(helper: HelperSuggestion): boolean {
    return this.selectedHelperId() === helper.userId;
  }

  onBack(): void {
    this.router.navigate(['/booking/step2']);
  }

  onNext(): void {
    if (this.bookingState.canProceedToStep4()) {
      this.router.navigate(['/booking/step4']);
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }
}
