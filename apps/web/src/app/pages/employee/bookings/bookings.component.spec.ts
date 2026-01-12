import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EmployeeBookingsComponent } from './bookings.component';
import { AdminService, BookingResponse, UserResponse } from '../../../core/services/admin.service';
import { PagedResult } from '../../../core/models/paged-result.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { HelperService } from '../../../core/services/helper.service';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('EmployeeBookingsComponent', () => {
  let component: EmployeeBookingsComponent;
  let fixture: ComponentFixture<EmployeeBookingsComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let helperServiceSpy: jasmine.SpyObj<HelperService>;

  const mockBookings: PagedResult<BookingResponse> = {
    items: [
      { id: 1, serviceName: 'Dọn dẹp', status: 'Pending', paymentStatus: 'Unpaid' } as any
    ],
    totalCount: 1,
    pageIndex: 1,
    pageSize: 10
  };

  const mockUsers: PagedResult<UserResponse> = {
    items: [
      { id: 1, fullName: 'Helper 1', role: 'Helper' } as any
    ],
    totalCount: 1,
    pageIndex: 1,
    pageSize: 100
  };

  beforeEach(async () => {
    const adminSpy = jasmine.createSpyObj('AdminService', ['getAllBookings', 'getAllUsers', 'updateBookingStatus', 'confirmPayment']);
    const notifSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'confirm', 'info', 'warning']);
    const helperSpy = jasmine.createSpyObj('HelperService', ['getAvailableHelpers']);

    await TestBed.configureTestingModule({
      imports: [EmployeeBookingsComponent],
      providers: [
        { provide: AdminService, useValue: adminSpy },
        { provide: NotificationService, useValue: notifSpy },
        { provide: HelperService, useValue: helperSpy },
        provideRouter([])
      ]
    }).compileComponents();

    adminServiceSpy = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    helperServiceSpy = TestBed.inject(HelperService) as jasmine.SpyObj<HelperService>;

    adminServiceSpy.getAllBookings.and.returnValue(of(mockBookings));
    adminServiceSpy.getAllUsers.and.returnValue(of(mockUsers));

    fixture = TestBed.createComponent(EmployeeBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load bookings and helpers on init', () => {
    expect(adminServiceSpy.getAllBookings).toHaveBeenCalled();
    expect(adminServiceSpy.getAllUsers).toHaveBeenCalled();
    expect(component.bookings().length).toBe(1);
    expect(component.availableHelpers().length).toBe(1);
  });

  it('should reload bookings when page changes', () => {
    component.onPageChange(2);
    expect(component.currentPage()).toBe(2);
    expect(adminServiceSpy.getAllBookings).toHaveBeenCalledTimes(2);
  });

  it('should reload bookings when filters applied', () => {
    component.statusFilter = 'Confirmed';
    component.applyFilters();
    expect(component.currentPage()).toBe(1);
    expect(adminServiceSpy.getAllBookings).toHaveBeenCalledWith(1, 10, 'Confirmed', '');
  });

  it('should confirm booking and reload', () => {
    adminServiceSpy.updateBookingStatus.and.returnValue(of(mockBookings.items[0]));
    component.confirmBooking(1);
    expect(adminServiceSpy.updateBookingStatus).toHaveBeenCalledWith(1, { status: 2 });
    expect(notificationServiceSpy.success).toHaveBeenCalled();
    expect(adminServiceSpy.getAllBookings).toHaveBeenCalledTimes(2);
  });

  it('should reject booking after confirmation', async () => {
    notificationServiceSpy.confirm.and.returnValue(Promise.resolve(true));
    adminServiceSpy.updateBookingStatus.and.returnValue(of(mockBookings.items[0]));
    
    await component.rejectBooking(1);
    
    expect(notificationServiceSpy.confirm).toHaveBeenCalled();
    expect(adminServiceSpy.updateBookingStatus).toHaveBeenCalledWith(1, { status: 3 });
    expect(notificationServiceSpy.success).toHaveBeenCalled();
  });

  it('should confirm payment after confirmation', async () => {
    notificationServiceSpy.confirm.and.returnValue(Promise.resolve(true));
    adminServiceSpy.confirmPayment.and.returnValue(of({}));
    
    await component.confirmPayment(1);
    
    expect(adminServiceSpy.confirmPayment).toHaveBeenCalledWith(1);
    expect(notificationServiceSpy.success).toHaveBeenCalled();
  });
});
