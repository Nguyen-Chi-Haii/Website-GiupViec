import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ============== Statistics Types ==============
export interface AdminStats {
  totalUsers: number;
  totalHelpers: number;
  totalCustomers: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

// ============== Booking Types ==============
export interface BookingResponse {
  id: number;
  customerId: number;
  customerName: string;
  helperId?: number;
  helperName?: string;
  serviceId: number;
  serviceName: string;
  address: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  isPaid: boolean;
  notes?: string;
  createdAt: string;
}

export interface BookingStatusUpdate {
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rejected';
}

export interface BookingAssignHelper {
  bookingId: number;
  helperId: number;
}

// ============== Service Types ==============
export interface ServiceResponse {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
}

export interface ServiceCreate {
  name: string;
  price: number;
}

export interface ServiceUpdate {
  name?: string;
  price?: number;
  isActive?: boolean;
}

// ============== User Types ==============
export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}

// ============== Helper Types ==============
export interface HelperProfile {
  id: number;
  userId: number;
  fullName: string;
  bio?: string;
  experienceYears: number;
  skills?: string;
  ratingAverage: number;
  totalReviews: number;
  isAvailable: boolean;
}

// ============== Admin Service ==============
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // --- Statistics ---
  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/statistics/admin`);
  }

  // --- Bookings ---
  getAllBookings(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.apiUrl}/bookings`);
  }

  getBookingById(id: number): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${this.apiUrl}/bookings/${id}`);
  }

  updateBookingStatus(id: number, dto: BookingStatusUpdate): Observable<any> {
    return this.http.put(`${this.apiUrl}/bookings/${id}/status`, dto);
  }

  assignHelper(dto: BookingAssignHelper): Observable<any> {
    return this.http.put(`${this.apiUrl}/bookings/assign-helper`, dto);
  }

  // --- Services ---
  getAllServices(): Observable<ServiceResponse[]> {
    return this.http.get<ServiceResponse[]>(`${this.apiUrl}/services`);
  }

  createService(dto: ServiceCreate): Observable<ServiceResponse> {
    return this.http.post<ServiceResponse>(`${this.apiUrl}/services`, dto);
  }

  updateService(id: number, dto: ServiceUpdate): Observable<ServiceResponse> {
    return this.http.put<ServiceResponse>(`${this.apiUrl}/services/${id}`, dto);
  }

  // --- Users ---
  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/users/${id}`);
  }

  // --- Helpers ---
  getHelperProfile(userId: number): Observable<HelperProfile> {
    return this.http.get<HelperProfile>(`${this.apiUrl}/helperprofiles/user/${userId}`);
  }
}
