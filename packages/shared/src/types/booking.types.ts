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
  quantity: number;         // Added for non-hourly services
  notes?: string;
  helperId?: number;        // Added to support reordering or pre-selection
  isJobPost?: boolean;      // Added to signal job posting mode
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
  customerPhone?: string;
  helperName?: string;
  serviceId: number;
  serviceName: string;
  address: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  quantity: number;         // Added
  serviceUnit: string;      // Added
  serviceUnitLabel?: string; // Added
  totalPrice: number;
  status: string;
  paymentStatus: string;
  isPaid: boolean;          // Added
  isRated: boolean;
  customerConfirmed: boolean;
  helperConfirmed: boolean;
  notes?: string;
  createdAt?: string;
  approvalStatus?: string; // Approved, Pending, Rejected
  rejectionReason?: string;
  isJobPost: boolean;
}

export interface BookingAssignHelperDTO {
  bookingId: number;
  helperId: number;
}

export interface BookingStatusUpdateDTO {
  status: BookingStatus;
}
