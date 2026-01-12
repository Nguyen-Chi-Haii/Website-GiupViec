import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EmployeeDashboardComponent } from './dashboard.component';
import { AdminService, AdminStats, BookingResponse } from '../../../core/services/admin.service';
import { PagedResult } from '../../../core/models/paged-result.interface';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

describe('EmployeeDashboardComponent', () => {
  let component: EmployeeDashboardComponent;
  let fixture: ComponentFixture<EmployeeDashboardComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;

  const mockStats: AdminStats = {
    totalUsers: 15,
    totalHelpers: 5,
    totalCustomers: 10,
    totalBookings: 10,
    totalRevenue: 5000000,
    pendingBookings: 2,
    completedBookings: 8,
    cancelledBookings: 0
  };

  const mockBookings: PagedResult<BookingResponse> = {
    items: [
      { id: 1, serviceName: 'Dọn dẹp', customerName: 'John', status: 'Pending', totalPrice: 100000, startDate: '2023-10-01T08:00:00', endDate: '2023-10-01T10:00:00' } as any
    ],
    totalCount: 1,
    pageIndex: 1,
    pageSize: 10
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AdminService', ['getEmployeeStats', 'getAllBookings', 'getRevenueChartData']);

    await TestBed.configureTestingModule({
      imports: [EmployeeDashboardComponent],
      providers: [
        { provide: AdminService, useValue: spy },
        provideRouter([])
      ]
    }).compileComponents();

    adminServiceSpy = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    adminServiceSpy.getEmployeeStats.and.returnValue(of(mockStats));
    adminServiceSpy.getAllBookings.and.returnValue(of(mockBookings));
    adminServiceSpy.getRevenueChartData.and.returnValue(of({ labels: [], revenues: [] }));

    fixture = TestBed.createComponent(EmployeeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial stats and bookings', () => {
    expect(adminServiceSpy.getEmployeeStats).toHaveBeenCalled();
    expect(adminServiceSpy.getAllBookings).toHaveBeenCalled();
    expect(component.stats()).toEqual(mockStats);
    expect(component.recentBookings().length).toBe(1);
    expect(component.isLoading()).toBeFalse();
  });

  it('should update stats when date range changes', () => {
    const newRange = { startDate: '2023-01-01', endDate: '2023-01-31' };
    component.onDateRangeChange(newRange);
    
    expect(component.startDate()).toBe('2023-01-01');
    expect(component.endDate()).toBe('2023-01-31');
    expect(adminServiceSpy.getEmployeeStats).toHaveBeenCalledTimes(2); // Initial + Change
  });

  it('should return correct status classes', () => {
    expect(component.getStatusClass('Pending')).toBe('pending');
    expect(component.getStatusClass('Confirmed')).toBe('confirmed');
    expect(component.getStatusClass('Unknown')).toBe('pending');
  });

  it('should handle error when loading stats', () => {
    spyOn(console, 'error');
    adminServiceSpy.getEmployeeStats.and.returnValue(throwError(() => new Error('API Error')));
    
    component.loadStats();
    
    expect(console.error).toHaveBeenCalled();
  });
});
