/**
 * Booking types matching API DTOs
 */

export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface BookingResponse {
  id: number;
  customerId: number;
  customerName: string;
  helperId: number;
  helperName: string;
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  address: string;
  startDate: Date | string;
  startTime: string;
  durationHours: number;
  totalPrice: number;
  status: BookingStatus;
  note?: string;
  createdAt: Date | string;
}

export interface BookingCreateDTO {
  helperId: number;
  serviceId: number;
  address: string;
  startDate: Date | string;
  startTime: string;
  durationHours: number;
  note?: string;
}

export interface BookingUpdateDTO {
  address?: string;
  startDate?: Date | string;
  startTime?: string;
  durationHours?: number;
  note?: string;
  status?: BookingStatus;
}
