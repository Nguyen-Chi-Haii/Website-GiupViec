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
  paymentStatus: string;
  totalPrice: number;
  isPaid: boolean;
  notes?: string;
  createdAt: string;
}

export interface BookingStatusUpdate {
  status: number; // 1=Pending, 2=Confirmed, 3=Rejected, 4=Completed, 5=Cancelled
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
  address?: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface UserCreate {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  address?: string;
  role: string;
  status: number;
}

export interface UserUpdate {
  fullName?: string;
  phone?: string;
  address?: string;
  password?: string;
  avatar?: string;
  // Note: role and status cannot be updated via API
}

// ============== Helper Types ==============
export interface HelperProfile {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  bio?: string;
  careerStartDate: string;
  ratingAverage: number;
  activeArea: string;
}

export interface AvailableHelper {
  id: number;
  fullName: string;
  email: string;
  ratingAverage: number;
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

  confirmPayment(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/bookings/${id}/payment-confirm`, {});
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

  createUser(dto: UserCreate): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/auth/register`, dto);
  }

  updateUser(id: number, dto: UserUpdate): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/users/${id}`, dto);
  }

  // --- Helpers ---
  getAllHelperProfiles(): Observable<HelperProfile[]> {
    return this.http.get<HelperProfile[]>(`${this.apiUrl}/helperprofiles`);
  }

  getHelperProfile(userId: number): Observable<HelperProfile> {
    return this.http.get<HelperProfile>(`${this.apiUrl}/helperprofiles/user/${userId}`);
  }

  // Note: For available helpers in booking, use HelperService.getAvailableHelpers() with filters
  // For admin assigning helpers, use getAllUsers() and filter by role = 'Helper'
}
