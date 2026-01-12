import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../models/paged-result.interface';
import { 
  ServiceResponse, 
  ServiceCreateDTO, 
  ServiceUpdateDTO, 
  ServiceUnit,
  BookingResponseDTO as SharedBookingResponse,
  BookingCreateDTO as SharedBookingCreate
} from '@giupviec/shared';

// Re-export for backward compatibility
export type { ServiceResponse, ServiceCreateDTO, ServiceUpdateDTO, ServiceUnit };
export type BookingResponse = SharedBookingResponse;
// REMOVING BookingCreate re-export to prefer the local interface which handles admin-specific fields
// export type BookingCreate = SharedBookingCreate; 

// ============== Statistics Types ==============
// ... (rest of stats)
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
  recentCompletedJobs: any[];
}

// ============== Booking Types ==============
// (Local BookingResponse removed in favor of SharedBookingResponse)

export interface BookingStatusUpdate {
  status: number; // 1=Pending, 2=Confirmed, 3=Rejected, 4=Completed, 5=Cancelled
}

export interface BookingAssignHelper {
  bookingId: number;
  helperId: number;
}

// Admin tạo đơn hàng (cần customerId thay vì lấy từ token)
// Admin tạo đơn hàng (cần customerId thay vì lấy từ token)
export interface BookingCreate {
  customerId: number;      // ID khách hàng
  serviceId: number;       // ID dịch vụ
  startDate: string;       // Format: YYYY-MM-DD
  endDate: string;         // Format: YYYY-MM-DD
  workShiftStart: string;  // Format: HH:mm:ss
  workShiftEnd: string;    // Format: HH:mm:ss
  address: string;         // Địa chỉ đầy đủ
  quantity: number;        // Thêm trường số lượng
  notes?: string;          // Ghi chú
  helperId?: number;       // ID helper (optional)
  isJobPost?: boolean;     // Thêm cờ nhận diện bài đăng
}

// ============== Service Types ==============
// (Local Service interfaces removed in favor of shared ones)

// ============== User Types ==============
export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  address?: string;
  avatar?: string;
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
  status: string;
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
  getAdminStats(startDate?: string, endDate?: string): Observable<AdminStats> {
    let params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.http.get<AdminStats>(`${this.apiUrl}/statistics/admin`, { params });
  }

  getEmployeeStats(startDate?: string, endDate?: string): Observable<AdminStats> {
    let params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.http.get<AdminStats>(`${this.apiUrl}/statistics/employee`, { params });
  }

  getHelperStats(startDate?: string, endDate?: string): Observable<HelperDashboardStats> {
    let params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.http.get<HelperDashboardStats>(`${this.apiUrl}/statistics/helper`, { params });
  }

  getRevenueChartData(startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics/revenue-chart`, { 
      params: { startDate, endDate } 
    });
  }

  // --- Bookings ---
  getAllBookings(pageIndex = 1, pageSize = 10, status?: string, paymentStatus?: string): Observable<PagedResult<SharedBookingResponse>> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString())
      .set('isJobPost', 'false'); // Always exclude unassigned job posts from general management
    
    if (status && status !== 'All') params = params.set('status', status);
    if (paymentStatus && paymentStatus !== 'All') params = params.set('paymentStatus', paymentStatus);
    
    return this.http.get<PagedResult<SharedBookingResponse>>(`${this.apiUrl}/bookings`, { params });
  }

  getBookingById(id: number): Observable<SharedBookingResponse> {
    return this.http.get<SharedBookingResponse>(`${this.apiUrl}/bookings/${id}`);
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
  createBooking(dto: BookingCreate): Observable<SharedBookingResponse> {
    return this.http.post<SharedBookingResponse>(`${this.apiUrl}/bookings/admin`, dto);
  }

  // --- Services ---
  getAllServices(pageIndex = 1, pageSize = 10): Observable<PagedResult<ServiceResponse>> {
    const params = { pageIndex: pageIndex.toString(), pageSize: pageSize.toString() };
    return this.http.get<PagedResult<ServiceResponse>>(`${this.apiUrl}/services`, { params });
  }

  createService(dto: ServiceCreateDTO): Observable<ServiceResponse> {
    return this.http.post<ServiceResponse>(`${this.apiUrl}/services`, dto);
  }

  updateService(id: number, dto: ServiceUpdateDTO): Observable<ServiceResponse> {
    return this.http.put<ServiceResponse>(`${this.apiUrl}/services/${id}`, dto);
  }

  // --- Users ---
  getAllUsers(pageIndex = 1, pageSize = 10): Observable<PagedResult<UserResponse>> {
    const params = { pageIndex: pageIndex.toString(), pageSize: pageSize.toString() };
    return this.http.get<PagedResult<UserResponse>>(`${this.apiUrl}/users`, { params });
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
  getAllHelperProfiles(pageIndex = 1, pageSize = 10): Observable<PagedResult<HelperProfile>> {
    const params = { pageIndex: pageIndex.toString(), pageSize: pageSize.toString() };
    return this.http.get<PagedResult<HelperProfile>>(`${this.apiUrl}/helperprofiles`, { params });
  }

  getServiceUnitLabels(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/services/unit-labels`);
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
