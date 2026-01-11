import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing/landing-page.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { HelperJobsComponent } from './pages/helper-jobs/helper-jobs.component';
import { BookingStep1Component } from './pages/booking/step1-service/step1-service.component';
import { BookingStep2Component } from './pages/booking/step2-schedule/step2-schedule.component';
import { BookingStep3Component } from './pages/booking/step3-helper/step3-helper.component';
import { BookingStep4Component } from './pages/booking/step4-confirm/step4-confirm.component';
// Admin imports
import { AdminLayoutComponent } from './pages/admin/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { AdminBookingsComponent } from './pages/admin/bookings/bookings.component';
import { AdminServicesComponent } from './pages/admin/services/services.component';
import { AdminUsersComponent } from './pages/admin/users/users.component';
import { AdminContentComponent } from './pages/admin/content/content.component';
// Helper imports
import { HelperLayoutComponent } from './pages/helper/helper-layout.component';
import { HelperDashboardComponent } from './pages/helper/dashboard/dashboard.component';
import { HelperScheduleComponent } from './pages/helper/schedule/schedule.component';
import { HelperProfileComponent } from './pages/helper/profile/profile.component';
// Customer imports
import { CustomerLayoutComponent } from './pages/customer/customer-layout.component';
import { CustomerMyBookingsComponent } from './pages/customer/my-bookings/my-bookings.component';
import { CustomerMyJobPostsComponent } from './pages/customer/my-job-posts/my-job-posts.component';
import { CustomerProfileComponent } from './pages/customer/profile/profile.component';
// Employee imports
import { EmployeeLayoutComponent } from './pages/employee/employee-layout.component';
import { EmployeeDashboardComponent } from './pages/employee/dashboard/dashboard.component';
import { EmployeeBookingsComponent } from './pages/employee/bookings/bookings.component';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    title: 'Giúp Việc Nhà - Dịch Vụ Tin Cậy'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Đăng Nhập - Giúp Việc Nhà'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Đăng Ký - Giúp Việc Nhà'
  },
  {
    path: 'helper-jobs',
    component: HelperJobsComponent,
    title: 'Tuyển Dụng Người Giúp Việc - Giúp Việc Nhà'
  },
  {
    path: 'booking',
    children: [
      {
        path: '',
        redirectTo: 'step1',
        pathMatch: 'full'
      },
      {
        path: 'step1',
        component: BookingStep1Component,
        title: 'Chọn Dịch Vụ - Giúp Việc Nhà'
      },
      {
        path: 'step2',
        component: BookingStep2Component,
        title: 'Lịch & Địa Chỉ - Giúp Việc Nhà'
      },
      {
        path: 'step3',
        component: BookingStep3Component,
        title: 'Chọn Người Giúp Việc - Giúp Việc Nhà'
      },
      {
        path: 'step4',
        component: BookingStep4Component,
        title: 'Xác Nhận Đặt Dịch Vụ - Giúp Việc Nhà'
      }
    ]
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notification-list.component').then(m => m.NotificationListComponent),
    title: 'Thông báo',
  },
  // Admin Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        component: AdminDashboardComponent,
        title: 'Tổng Quan - Admin'
      },
      {
        path: 'bookings',
        component: AdminBookingsComponent,
        title: 'Quản Lý Đơn Hàng - Admin'
      },
      {
        path: 'approvals',
        loadComponent: () => import('./pages/admin/bookings/pending-approvals/pending-approvals.component').then(m => m.PendingApprovalsComponent),
        title: 'Duyệt Bài Đăng - Admin'
      },
      {
        path: 'services',
        component: AdminServicesComponent,
        title: 'Quản Lý Dịch Vụ - Admin'
      },
      {
        path: 'users',
        component: AdminUsersComponent,
        title: 'Người Dùng - Admin'
      },
      {
        path: 'helpers',
        loadComponent: () => import('./pages/admin/helpers/helpers.component').then(m => m.AdminHelpersComponent),
        title: 'Người Giúp Việc - Admin'
      },
      {
        path: 'content',
        component: AdminContentComponent,
        title: 'Quản Lý Nội Dung - Admin'
      }
    ]
  },
  // Helper Routes
  {
    path: 'helper',
    component: HelperLayoutComponent,
    children: [
      {
        path: '',
        component: HelperDashboardComponent,
        title: 'Tổng Quan - Helper'
      },
      {
        path: 'schedule',
        component: HelperScheduleComponent,
        title: 'Lịch Làm Việc - Helper'
      },
      {
        path: 'jobs',
        loadComponent: () => import('./pages/helper/available-jobs/available-jobs.component').then(m => m.AvailableJobsComponent),
        title: 'Tìm Việc Mới - Helper'
      },
      {
        path: 'my-jobs',
        loadComponent: () => import('./pages/helper/jobs/my-jobs/my-jobs.component').then(m => m.MyJobsComponent),
        title: 'Công Việc Của Tôi - Helper'
      },
      {
        path: 'profile',
        component: HelperProfileComponent,
        title: 'Hồ Sơ Của Tôi - Helper'
      }
    ]
  },
  // Customer Routes
  {
    path: 'customer',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/customer/dashboard/dashboard.component').then(m => m.CustomerDashboardComponent),
        title: 'Tổng Quan - Khách Hàng'
      },
      {
        path: 'my-bookings',
        component: CustomerMyBookingsComponent,
        title: 'Đơn Của Tôi - Khách Hàng'
      },
      {
        path: 'job-posts',
        component: CustomerMyJobPostsComponent,
        title: 'Bài Đăng Của Tôi - Khách Hàng'
      },
      {
        path: 'profile',
        component: CustomerProfileComponent,
        title: 'Hồ Sơ - Khách Hàng'
      }
    ]
  },
  // Employee Routes
  {
    path: 'employee',
    component: EmployeeLayoutComponent,
    children: [
      {
        path: '',
        component: EmployeeDashboardComponent,
        title: 'Tổng Quan - Nhân Viên'
      },
      {
        path: 'bookings',
        component: EmployeeBookingsComponent,
        title: 'Quản Lý Đơn - Nhân Viên'
      },
      {
        path: 'helpers',
        loadComponent: () => import('./pages/employee/helpers/helpers.component').then(m => m.EmployeeHelpersComponent),
        title: 'Người Giúp Việc - Nhân Viên'
      },
      {
        path: 'customers',
        loadComponent: () => import('./pages/employee/customers/customers.component').then(m => m.EmployeeCustomersComponent),
        title: 'Khách Hàng - Nhân Viên'
      },
      {
        path: 'calendar',
        loadComponent: () => import('./pages/employee/calendar/calendar.component').then(m => m.EmployeeCalendarComponent),
        title: 'Lịch Vận Hành - Nhân Viên'
      },
      {
        path: 'approvals',
        loadComponent: () => import('./pages/admin/bookings/pending-approvals/pending-approvals.component').then(m => m.PendingApprovalsComponent),
        title: 'Duyệt Bài Đăng - Nhân Viên'
      },
      {
        path: 'services',
        loadComponent: () => import('./pages/employee/services/services.component').then(m => m.EmployeeServicesComponent),
        title: 'Dịch Vụ - Nhân Viên'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
