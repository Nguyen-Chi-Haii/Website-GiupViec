import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookingCreateDTO, BookingResponseDTO } from '@giupviec/shared';

// Guest booking request DTO
export interface GuestBookingCreateDTO {
  fullName: string;
  email: string;
  phone?: string;
  serviceId: number;
  startDate: string;
  endDate: string;
  workShiftStart: string;
  workShiftEnd: string;
  address: string;
  notes?: string;
  captchaToken: string;
}

// Guest booking response DTO
export interface GuestBookingResponseDTO {
  bookingId: number;
  customerEmail: string;
  tempPassword: string;
  serviceName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  address: string;
  totalPrice: number;
  status: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/bookings`;

  /**
   * Create a new booking
   * POST /api/bookings (requires auth)
   */
  create(dto: BookingCreateDTO): Observable<BookingResponseDTO> {
    return this.http.post<BookingResponseDTO>(this.baseUrl, dto);
  }

  /**
   * Create a guest booking (no auth required)
   * POST /api/bookings/guest
   */
  createGuestBooking(dto: GuestBookingCreateDTO): Observable<GuestBookingResponseDTO> {
    return this.http.post<GuestBookingResponseDTO>(`${this.baseUrl}/guest`, dto);
  }

  /**
   * Get all bookings
   * GET /api/bookings
   */
  getAll(): Observable<BookingResponseDTO[]> {
    return this.http.get<BookingResponseDTO[]>(this.baseUrl);
  }

  /**
   * Get booking by ID
   * GET /api/bookings/{id}
   */
  getById(id: number): Observable<BookingResponseDTO> {
    return this.http.get<BookingResponseDTO>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get bookings for the current customer
   * GET /api/bookings/my
   */
  getMyBookings(): Observable<BookingResponseDTO[]> {
    return this.http.get<BookingResponseDTO[]>(`${this.baseUrl}/my`);
  }

  confirmByCustomer(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/confirm-customer`, {});
  }

  confirmByHelper(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/confirm-helper`, {});
  }
}
