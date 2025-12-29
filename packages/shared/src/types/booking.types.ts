/**
 * Booking types matching API DTOs - Updated for 2025
 */

export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled'
}

export enum PaymentStatus {
  Unpaid = 'Unpaid',
  Paid = 'Paid'
}

export interface BookingCreateDTO {
  serviceId: number;
  startDate: string;        // ISO date string
  endDate: string;          // ISO date string
  workShiftStart: string;   // TimeSpan format: "HH:mm:ss"
  workShiftEnd: string;     // TimeSpan format: "HH:mm:ss"
  address: string;
  notes?: string;
}

export interface BookingUpdateDTO {
  startDate?: string;
  endDate?: string;
  workShiftStart?: string;
  workShiftEnd?: string;
  address?: string;
  notes?: string;
}

export interface BookingResponseDTO {
  id: number;
  customerId: number;
  helperId?: number;
  customerName: string;
  helperName?: string;
  serviceName: string;
  address: string;
  startDate: string;
  endDate: string;
  workShiftStart: string;
  workShiftEnd: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
}

export interface BookingAssignHelperDTO {
  bookingId: number;
  helperId: number;
}

export interface BookingStatusUpdateDTO {
  status: BookingStatus;
}
