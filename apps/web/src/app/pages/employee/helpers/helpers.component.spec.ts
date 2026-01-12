import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EmployeeHelpersComponent } from './helpers.component';
import { AdminService, HelperProfile } from '../../../core/services/admin.service';
import { PagedResult } from '../../../core/models/paged-result.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('EmployeeHelpersComponent', () => {
  let component: EmployeeHelpersComponent;
  let fixture: ComponentFixture<EmployeeHelpersComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const mockHelpers: PagedResult<HelperProfile> = {
    items: [
      { 
        id: 1, 
        userId: 1, 
        fullName: 'Helper 1', 
        email: 'helper@test.com', 
        phone: '0123456789', 
        activeArea: 'Hà Nội', 
        status: 'Active', 
        experienceYears: 2, 
        hourlyRate: 100000,
        careerStartDate: '2021-01-01',
        ratingAverage: 4.5,
        ratingCount: 10
      } as HelperProfile
    ],
    totalCount: 1,
    pageIndex: 1,
    pageSize: 10
  };

  beforeEach(async () => {
    const adminSpy = jasmine.createSpyObj('AdminService', ['getAllHelperProfiles', 'updateHelperProfile', 'adminCreateHelper', 'updateUser']);
    const notifSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'confirm']);

    await TestBed.configureTestingModule({
      imports: [EmployeeHelpersComponent],
      providers: [
        { provide: AdminService, useValue: adminSpy },
        { provide: NotificationService, useValue: notifSpy },
        provideRouter([])
      ]
    }).compileComponents();

    adminServiceSpy = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    adminServiceSpy.getAllHelperProfiles.and.returnValue(of(mockHelpers));

    fixture = TestBed.createComponent(EmployeeHelpersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load helpers on init', () => {
    expect(adminServiceSpy.getAllHelperProfiles).toHaveBeenCalled();
    expect(component.helpers().length).toBe(1);
    expect(component.helpers()[0].fullName).toBe('Helper 1');
  });

  it('should validate form data correctly', () => {
    component.openCreateModal();
    
    // Initial state (empty)
    expect(Object.keys(component.errors()).length).toBeGreaterThan(0);
    
    // Valid data
    component.formData.fullName.set('John Doe');
    component.formData.email.set('john@example.com');
    component.formData.password.set('password123');
    component.formData.phone.set('0987654321');
    component.formData.activeArea.set('District 1');
    
    expect(Object.keys(component.errors()).length).toBe(0);
  });

  it('should call adminCreateHelper when saving new helper', () => {
    component.openCreateModal();
    component.formData.fullName.set('John Doe');
    component.formData.email.set('john@example.com');
    component.formData.password.set('password123');
    component.formData.phone.set('0987654321');
    component.formData.activeArea.set('District 1');
    
    adminServiceSpy.adminCreateHelper.and.returnValue(of(mockHelpers.items[0]));
    component.saveHelper();
    
    expect(adminServiceSpy.adminCreateHelper).toHaveBeenCalled();
    expect(notificationServiceSpy.success).toHaveBeenCalled();
  });

  it('should call updateHelperProfile when editing helper', () => {
    component.openEditModal(mockHelpers.items[0]);
    component.formData.bio.set('Updated bio');
    
    adminServiceSpy.updateHelperProfile.and.returnValue(of(mockHelpers.items[0]));
    component.saveHelper();
    
    expect(adminServiceSpy.updateHelperProfile).toHaveBeenCalled();
    expect(notificationServiceSpy.success).toHaveBeenCalled();
  });

  it('should toggle status after confirmation', async () => {
    notificationServiceSpy.confirm.and.returnValue(Promise.resolve(true));
    adminServiceSpy.updateUser.and.returnValue(of({ id: 1, fullName: 'Helper 1' } as any));
    
    await component.toggleStatus(mockHelpers.items[0]);
    
    expect(notificationServiceSpy.confirm).toHaveBeenCalled();
    expect(adminServiceSpy.updateUser).toHaveBeenCalled();
    expect(notificationServiceSpy.success).toHaveBeenCalled();
  });
});
