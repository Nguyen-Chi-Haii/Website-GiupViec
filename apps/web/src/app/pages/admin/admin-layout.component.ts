import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Logo Area -->
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">
              <span class="material-symbols-outlined">cleaning_services</span>
            </div>
            <h1 class="logo-text">GiúpViệc Admin</h1>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          @for (item of navItems; track item.route) {
            <a 
              class="nav-item" 
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{exact: item.route === '/admin'}"
            >
              <span class="material-symbols-outlined">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <!-- User Profile & Logout -->
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">AD</div>
            <div class="user-details">
              <p class="user-name">Admin User</p>
              <p class="user-email">admin&#64;giupviecnha.vn</p>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">
            <span class="material-symbols-outlined">logout</span>
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Top Header -->
        <header class="top-header">
          <div class="header-left">
            <!-- Removed duplicate title - each page has its own -->
          </div>
          <div class="header-right">
            <!-- Search -->
            <div class="search-box">
              <span class="material-symbols-outlined">search</span>
              <input type="text" placeholder="Tìm kiếm..." [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" />
            </div>
            <!-- Notifications -->
            <button class="header-btn" (click)="showNotifications()" title="Thông báo">
              <span class="material-symbols-outlined">notifications</span>
              <span class="notification-badge"></span>
            </button>
            <!-- Settings -->
            <button class="header-btn" (click)="showSettings()" title="Cài đặt">
              <span class="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        <!-- Scrollable Content -->
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: #f6f8f8;
    }

    /* Sidebar */
    .sidebar {
      width: 260px;
      flex-shrink: 0;
      background: white;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .sidebar-header {
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: rgba(19, 185, 165, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #13b9a5;
    }

    .logo-text {
      font-size: 1.1rem;
      font-weight: 700;
      color: #111817;
      margin: 0;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      color: #638884;
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s;
    }

    .nav-item:hover {
      background: #f6f8f8;
      color: #111817;
    }

    .nav-item.active {
      background: rgba(19, 185, 165, 0.1);
      color: #13b9a5;
    }

    .nav-item .material-symbols-outlined {
      font-size: 22px;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #13b9a5 0%, #0f9685 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .user-details {
      overflow: hidden;
    }

    .user-name {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: #111817;
    }

    .user-email {
      margin: 0;
      font-size: 0.8rem;
      color: #638884;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.5rem;
      border: none;
      background: none;
      color: #638884;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s;
    }

    .logout-btn:hover {
      color: #ef4444;
    }

    .logout-btn .material-symbols-outlined {
      font-size: 20px;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    .top-header {
      height: 64px;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      flex-shrink: 0;
    }

    .page-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111817;
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f6f8f8;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      min-width: 240px;
    }

    .search-box .material-symbols-outlined {
      color: #638884;
      font-size: 20px;
    }

    .search-box input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.9rem;
      color: #111817;
      width: 100%;
    }

    .search-box input::placeholder {
      color: #638884;
    }

    .header-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      border-radius: 8px;
      color: #111817;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .header-btn:hover {
      background: #f6f8f8;
    }

    .notification-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .sidebar {
        display: none;
      }
      
      .search-box {
        display: none;
      }
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  private readonly router = inject(Router);
  
  navItems: NavItem[] = [
    { label: 'Tổng Quan', icon: 'dashboard', route: '/admin' },
    { label: 'Quản Lý Đơn Hàng', icon: 'receipt_long', route: '/admin/bookings' },
    { label: 'Quản Lý Dịch Vụ', icon: 'mop', route: '/admin/services' },
    { label: 'Người Giúp Việc', icon: 'badge', route: '/admin/helpers' },
    { label: 'Người Dùng', icon: 'group', route: '/admin/users' },
    { label: 'Quản Lý Nội Dung', icon: 'edit_note', route: '/admin/content' }
  ];

  currentPageTitle = 'Tổng Quan';

  ngOnInit(): void {
    this.updatePageTitle(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });
  }

  private updatePageTitle(url: string): void {
    const matched = this.navItems.find(item => item.route === url);
    this.currentPageTitle = matched?.label || 'Tổng Quan';
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  showNotifications(): void {
    alert('Tính năng Thông báo đang được phát triển.');
  }

  showSettings(): void {
    alert('Tính năng Cài đặt đang được phát triển.');
  }

  searchQuery = '';

  onSearch(): void {
    if (this.searchQuery.trim()) {
      alert('Tìm kiếm: "' + this.searchQuery + '"\nTính năng tìm kiếm đang được phát triển.');
    }
  }
}
