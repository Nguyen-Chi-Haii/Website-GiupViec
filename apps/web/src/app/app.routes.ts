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
import { AdminHelpersComponent } from './pages/admin/helpers/helpers.component';
import { AdminUsersComponent } from './pages/admin/users/users.component';
import { AdminContentComponent } from './pages/admin/content/content.component';

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
  // Admin Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    // TODO: Add AuthGuard for admin role
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
        path: 'services',
        component: AdminServicesComponent,
        title: 'Quản Lý Dịch Vụ - Admin'
      },
      {
        path: 'helpers',
        component: AdminHelpersComponent,
        title: 'Người Giúp Việc - Admin'
      },
      {
        path: 'users',
        component: AdminUsersComponent,
        title: 'Người Dùng - Admin'
      },
      {
        path: 'content',
        component: AdminContentComponent,
        title: 'Quản Lý Nội Dung - Admin'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

