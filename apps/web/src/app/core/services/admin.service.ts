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

export interface HelperDashboardStats {
  totalJobs: number;
  totalEarnings: number;
  totalCompletedJobs: number;
  totalUpcomingJobs: number;
  averageRating: number;
  ratingCount: number;
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

// Admin tạo đơn hàng (cần customerId thay vì lấy từ token)
export interface BookingCreate {
  customerId: number;      // ID khách hàng
  serviceId: number;       // ID dịch vụ
  startDate: string;       // Format: YYYY-MM-DD
  endDate: string;         // Format: YYYY-MM-DD
  workShiftStart: string;  // Format: HH:mm:ss
  workShiftEnd: string;    // Format: HH:mm:ss
  address: string;         // Địa chỉ đầy đủ
  notes?: string;          // Ghi chú
  helperId?: number;       // ID helper (optional)
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
  phone: string;  // Changed from phoneNumber to match backend UserResponseDTO
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
  avatar?: string;
  address?: string;
  role: number; // 1=Customer, 2=Helper, 3=Employee, 4=Admin
  status: number; // 1=Active, 2=Inactive
}

export interface UserUpdate {
  fullName?: string;
  phone?: string;
  address?: string;
  password?: string;
  avatar?: string;
  role?: number;   // 1=Customer, 2=Helper, 3=Employee, 4=Admin
  status?: number; // 1=Active, 2=Inactive
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
  ratingCount: number;
  activeArea: string;
  experienceYears: number;
  hourlyRate: number;
  status: any;
}

export interface AvailableHelper {
  id: number;
  fullName: string;
  email: string;
  ratingAverage: number;
  experienceYears: number;
  hourlyRate: number;
}

export interface AdminHelperCreate {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  avatar?: string;
  address?: string;
  activeArea: string;
  bio?: string;
  experienceYears: number;
  hourlyRate?: number;
}

export interface HelperProfileUpdate {
  activeArea?: string;
  bio?: string;
  experienceYears?: number;
  hourlyRate?: number;
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

  getEmployeeStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/statistics/employee`);
  }

  getHelperStats(): Observable<HelperDashboardStats> {
    return this.http.get<HelperDashboardStats>(`${this.apiUrl}/statistics/helper`);
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

  // Lấy tất cả lịch làm việc (Dành cho Admin/Employee)
  getAllSchedules(from: string, to: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bookings/all-schedules?from=${from}&to=${to}`);
  }

  // Admin tạo đơn hàng mới
  createBooking(dto: BookingCreate): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.apiUrl}/bookings/admin`, dto);
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

  updateUserStatus(id: number, status: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}/status`, { status });
  }

  // --- Helpers ---
  getAllHelperProfiles(): Observable<HelperProfile[]> {
    return this.http.get<HelperProfile[]>(`${this.apiUrl}/helperprofiles`);
  }

  getHelperProfile(userId: number): Observable<HelperProfile> {
    return this.http.get<HelperProfile>(`${this.apiUrl}/helperprofiles/user/${userId}`);
  }

  deleteHelperProfile(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/helperprofiles/${id}`);
  }

  // Admin creates helper with user data in one go (NEW combined endpoint)
  adminCreateHelper(dto: AdminHelperCreate): Observable<HelperProfile> {
    return this.http.post<HelperProfile>(`${this.apiUrl}/helperprofiles/admin/create`, dto);
  }

  // Update helper profile
  updateHelperProfile(userId: number, dto: HelperProfileUpdate): Observable<HelperProfile> {
    return this.http.put<HelperProfile>(`${this.apiUrl}/helperprofiles/user/${userId}`, dto);
  }

  createHelperProfile(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/helperprofiles`, dto);
  }

  // Note: For available helpers in booking, use HelperService.getAvailableHelpers() with filters
  // For admin assigning helpers, use getAllUsers() and filter by role = 'Helper'
}
