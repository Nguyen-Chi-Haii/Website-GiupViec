import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EmployeeCustomersComponent } from './customers.component';
import { AdminService, UserResponse } from '../../../core/services/admin.service';
import { PagedResult } from '../../../core/models/paged-result.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('EmployeeCustomersComponent', () => {
  let component: EmployeeCustomersComponent;
  let fixture: ComponentFixture<EmployeeCustomersComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const mockUsers: PagedResult<UserResponse> = {
    items: [
      { id: 1, fullName: 'Customer 1', email: 'customer@test.com', phone: '0123456789', role: 'Customer', status: 'Active', createdAt: '2021-01-01' } as UserResponse
    ],
    totalCount: 1,
    pageIndex: 1,
    pageSize: 10
  };

  beforeEach(async () => {
    const adminSpy = jasmine.createSpyObj('AdminService', ['getAllUsers', 'updateUser']);
    const notifSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'confirm']);

    await TestBed.configureTestingModule({
      imports: [EmployeeCustomersComponent],
      providers: [
        { provide: AdminService, useValue: adminSpy },
        { provide: NotificationService, useValue: notifSpy },
        provideRouter([])
      ]
    }).compileComponents();

    adminServiceSpy = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    adminServiceSpy.getAllUsers.and.returnValue(of(mockUsers));

    fixture = TestBed.createComponent(EmployeeCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load customers on init', () => {
    expect(adminServiceSpy.getAllUsers).toHaveBeenCalled();
    expect(component.customers().length).toBe(1);
    expect(component.customers()[0].fullName).toBe('Customer 1');
  });

  it('should open edit modal with user data', () => {
    component.openEditModal(mockUsers.items[0]);
    expect(component.editingId).toBe(1);
    expect(component.formData.fullName()).toBe('Customer 1');
    expect(component.showModal()).toBeTrue();
  });

  it('should validate form data (fullName length)', () => {
    component.formData.fullName.set('A');
    expect(component.errors()['fullName']).toBeDefined();
    
    component.formData.fullName.set('Valid Name');
    expect(component.errors()['fullName']).toBeUndefined();
  });

  it('should call updateUser and reload on save', () => {
    component.openEditModal(mockUsers.items[0]);
    component.formData.fullName.set('Updated Name');
    
    adminServiceSpy.updateUser.and.returnValue(of(mockUsers.items[0]));
    component.saveUser();
    
    expect(adminServiceSpy.updateUser).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(notificationServiceSpy.success).toHaveBeenCalled();
    expect(adminServiceSpy.getAllUsers).toHaveBeenCalledTimes(2); // Initial + Reload
  });

  it('should toggle user status after confirmation', async () => {
    notificationServiceSpy.confirm.and.returnValue(Promise.resolve(true));
    adminServiceSpy.updateUser.and.returnValue(of(mockUsers.items[0]));
    
    await component.toggleStatus(mockUsers.items[0]);
    
    expect(notificationServiceSpy.confirm).toHaveBeenCalled();
    expect(adminServiceSpy.updateUser).toHaveBeenCalled();
    expect(notificationServiceSpy.success).toHaveBeenCalled();
  });
});
