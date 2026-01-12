import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BookingCreateDTO, BookingResponseDTO } from '@giupviec/shared';
import { PagedResult } from '../models/paged-result.interface';

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
  getAll(pageIndex = 1, pageSize = 10): Observable<PagedResult<BookingResponseDTO>> {
    const params = { pageIndex: pageIndex.toString(), pageSize: pageSize.toString() };
    return this.http.get<PagedResult<BookingResponseDTO>>(this.baseUrl, { params });
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
  getMyBookings(pageIndex = 1, pageSize = 10, status?: string, isJobPost?: boolean, approvalStatus?: string): Observable<PagedResult<BookingResponseDTO>> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());
    
    if (status && status !== 'All') params = params.set('status', status);
    if (isJobPost !== undefined) params = params.set('isJobPost', isJobPost.toString());
    if (approvalStatus) params = params.set('approvalStatus', approvalStatus);
    
    return this.http.get<PagedResult<BookingResponseDTO>>(`${this.baseUrl}/my`, { params });
  }

  confirmByCustomer(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/confirm-customer`, {});
  }

  confirmByHelper(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/confirm-helper`, {});
  }

  // Helper: Tìm việc
  findAvailableJobs(filter: import('../models/booking-filter.dto').AvailableJobFilterDTO): Observable<PagedResult<BookingResponseDTO>> {
    // Convert filter object to HttpParams
    let params = new HttpParams()
      .set('pageIndex', filter.pageIndex.toString())
      .set('pageSize', filter.pageSize.toString());
      
    if (filter.serviceId) params = params.set('serviceId', filter.serviceId.toString());
    if (filter.province) params = params.set('province', filter.province);
    if (filter.minPrice) params = params.set('minPrice', filter.minPrice.toString());
    if (filter.maxPrice) params = params.set('maxPrice', filter.maxPrice.toString());
    if (filter.startDateFrom) params = params.set('startDateFrom', filter.startDateFrom);
    if (filter.startDateTo) params = params.set('startDateTo', filter.startDateTo);
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
    
    return this.http.get<PagedResult<BookingResponseDTO>>(`${this.baseUrl}/available`, { params });
  }

  // Helper: Nhận việc
  acceptJob(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/accept`, {});
  }

  // Admin: Lấy danh sách bài đăng gom đơn
  getJobPosts(pageIndex = 1, pageSize = 10, approvalStatus?: string, status?: string): Observable<PagedResult<BookingResponseDTO>> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());
    
    if (approvalStatus) params = params.set('approvalStatus', approvalStatus);
    if (status) params = params.set('status', status);
    
    return this.http.get<PagedResult<BookingResponseDTO>>(`${this.baseUrl}/job-posts`, { params });
  }

  // Admin: Duyệt đơn
  approve(id: number, note?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/approve`, { Note: note });
  }

  // Admin: Từ chối đơn
  reject(id: number, reason: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/reject`, { Reason: reason });
  }
  // Helper: Get My Jobs
  getHelperJobs(pageIndex = 1, pageSize = 10, status?: string): Observable<PagedResult<BookingResponseDTO>> {
    let params: any = {
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString()
    };
    if (status && status !== 'All') {
      params.status = status;
    }
    return this.http.get<PagedResult<BookingResponseDTO>>(`${this.baseUrl}/my-jobs`, { params });
  }

  /**
   * Update booking status
   * PUT /api/bookings/{id}/status
   */
  updateStatus(id: number, status: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/status`, { status });
  }

  /**
   * Cancel booking by customer
   */
  cancelByCustomer(id: number): Observable<any> {
    // Status 5 is Cancelled
    return this.updateStatus(id, 5);
  }
}
