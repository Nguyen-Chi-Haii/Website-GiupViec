import { Injectable, signal, computed } from '@angular/core';
import { ServiceResponse, HelperSuggestion } from '@giupviec/shared';

export interface BookingSchedule {
  startDate: string;
  endDate: string;
  workShiftStart: string;
  workShiftEnd: string;
}

export interface BookingAddress {
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  streetAddress: string;
  fullAddress: string;
}

export interface BookingState {
  currentStep: number;
  selectedService: ServiceResponse | null;
  schedule: BookingSchedule | null;
  address: BookingAddress | null;
  notes: string;
  selectedHelper: HelperSuggestion | null;
  autoAssignHelper: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BookingStateService {
  // State signals
  private _currentStep = signal(1);
  private _selectedService = signal<ServiceResponse | null>(null);
  private _schedule = signal<BookingSchedule | null>(null);
  private _address = signal<BookingAddress | null>(null);
  private _notes = signal('');
  private _selectedHelper = signal<HelperSuggestion | null>(null);
  private _autoAssignHelper = signal(true);

  // Public readonly signals
  readonly currentStep = this._currentStep.asReadonly();
  readonly selectedService = this._selectedService.asReadonly();
  readonly schedule = this._schedule.asReadonly();
  readonly address = this._address.asReadonly();
  readonly notes = this._notes.asReadonly();
  readonly selectedHelper = this._selectedHelper.asReadonly();
  readonly autoAssignHelper = this._autoAssignHelper.asReadonly();

  // Computed values
  readonly canProceedToStep2 = computed(() => this._selectedService() !== null);
  readonly canProceedToStep3 = computed(() => 
    this._schedule() !== null && this._address() !== null
  );
  readonly canProceedToStep4 = computed(() => 
    this._autoAssignHelper() || this._selectedHelper() !== null
  );

  // Calculate total hours
  readonly totalHours = computed(() => {
    const schedule = this._schedule();
    if (!schedule) return 0;

    const start = this.timeToMinutes(schedule.workShiftStart);
    const end = this.timeToMinutes(schedule.workShiftEnd);
    const hoursPerDay = (end - start) / 60;

    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return hoursPerDay * days;
  });

  // Calculate total price
  readonly totalPrice = computed(() => {
    const service = this._selectedService();
    const hours = this.totalHours();
    if (!service) return 0;
    return service.price * hours;
  });

  // Actions
  setCurrentStep(step: number): void {
    this._currentStep.set(step);
  }

  setSelectedService(service: ServiceResponse): void {
    this._selectedService.set(service);
  }

  setSchedule(schedule: BookingSchedule): void {
    this._schedule.set(schedule);
  }

  setAddress(address: BookingAddress): void {
    this._address.set(address);
  }

  setNotes(notes: string): void {
    this._notes.set(notes);
  }

  setSelectedHelper(helper: HelperSuggestion | null): void {
    this._selectedHelper.set(helper);
    if (helper) {
      this._autoAssignHelper.set(false);
    }
  }

  setAutoAssignHelper(auto: boolean): void {
    this._autoAssignHelper.set(auto);
    if (auto) {
      this._selectedHelper.set(null);
    }
  }

  // Get full state for API call
  getBookingData() {
    const address = this._address();
    return {
      serviceId: this._selectedService()?.id ?? 0,
      startDate: this._schedule()?.startDate ?? '',
      endDate: this._schedule()?.endDate ?? '',
      workShiftStart: this._schedule()?.workShiftStart ?? '',
      workShiftEnd: this._schedule()?.workShiftEnd ?? '',
      address: address?.fullAddress ?? '',
      notes: this._notes() || undefined
    };
  }

  // Reset state
  reset(): void {
    this._currentStep.set(1);
    this._selectedService.set(null);
    this._schedule.set(null);
    this._address.set(null);
    this._notes.set('');
    this._selectedHelper.set(null);
    this._autoAssignHelper.set(true);
  }

  // Helper method to convert time string to minutes
  private timeToMinutes(time: string): number {
    const parts = time.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
}
