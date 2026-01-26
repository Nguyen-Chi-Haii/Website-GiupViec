import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-helper-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent],
  template: `
    <div class="layout">
      <!-- Mobile Overlay -->
      <div class="sidebar-overlay" [class.show]="isMobileMenuOpen()" (click)="closeMobileMenu()"></div>

      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()" [class.mobile-open]="isMobileMenuOpen()">
        <div class="sidebar-header">
          <a class="logo" routerLink="/">
            <div class="logo-icon">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor"></path>
              </svg>
            </div>
            @if (!sidebarCollapsed()) {
              <span class="logo-text">Giúp Việc</span>
            }
          </a>
          <button class="toggle-btn" (click)="toggleSidebar()">
            <span class="material-symbols-outlined">
              {{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}
            </span>
          </button>
          <!-- Close button for mobile -->
          <button class="toggle-btn mobile-close" (click)="closeMobileMenu()">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/helper" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item" (click)="closeMobileMenu()">
            <span class="material-symbols-outlined">dashboard</span>
            @if (!sidebarCollapsed()) { <span>Tổng Quan</span> }
          </a>
          <a routerLink="/helper/schedule" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <span class="material-symbols-outlined">calendar_month</span>
            @if (!sidebarCollapsed()) { <span>Lịch Làm Việc</span> }
          </a>
          <a routerLink="/helper/jobs" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <span class="material-symbols-outlined">search</span>
            @if (!sidebarCollapsed()) { <span>Tìm Việc Mới</span> }
          </a>
          <a routerLink="/helper/my-jobs" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <span class="material-symbols-outlined">work</span>
            @if (!sidebarCollapsed()) { <span>Công Việc Của Tôi</span> }
          </a>
          <a routerLink="/helper/profile" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <span class="material-symbols-outlined">person</span>
            @if (!sidebarCollapsed()) { <span>Hồ Sơ Của Tôi</span> }
          </a>
          <!-- Chat Button -->

        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">{{ getUserInitials() }}</div>
            @if (!sidebarCollapsed()) {
              <div class="user-details">
                <span class="user-name">{{ currentUser()?.email }}</span>
                <span class="user-role">Người giúp việc</span>
              </div>
            }
          </div>
          <button class="logout-btn" (click)="logout()">
            <span class="material-symbols-outlined">logout</span>
            @if (!sidebarCollapsed()) { <span>Đăng xuất</span> }
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Header for Mobile/Title -->
        <header class="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm sticky top-0 z-10">
           <div class="flex items-center gap-3">
             <button class="menu-btn" (click)="toggleMobileMenu()">
               <span class="material-symbols-outlined">menu</span>
             </button>
             <h1 class="text-xl font-bold text-gray-800">{{ getPageTitle() }}</h1>
           </div>
           <div class="flex items-center gap-4">
              <app-notification-bell></app-notification-bell>
           </div>
        </header>

        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; height: 100vh; overflow: hidden; background: #f6f8f8; }
    .sidebar { width: 260px; background: white; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; transition: width 0.3s; height: 100%; }
    .sidebar.collapsed { width: 72px; }
    .sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid #e5e7eb; flex-shrink: 0; }
    .logo { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
    .logo-icon { width: 32px; height: 32px; color: #13b9a5; }
    .logo-text { font-size: 1.1rem; font-weight: 700; color: #111817; }
    .toggle-btn { background: none; border: none; cursor: pointer; color: #638884; padding: 0.25rem; border-radius: 4px; }
    .toggle-btn:hover { background: #f6f8f8; }
    .sidebar-nav { flex: 1; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; overflow-y: auto; }
    .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 8px; color: #638884; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: all 0.2s; }
    .nav-item:hover { background: #f6f8f8; color: #111817; }
    .nav-item.active { background: rgba(19, 185, 165, 0.1); color: #13b9a5; }
    .nav-item .material-symbols-outlined { font-size: 22px; }
    .sidebar-footer { padding: 1rem; border-top: 1px solid #e5e7eb; flex-shrink: 0; }
    .user-info { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.8rem; }
    .user-details { display: flex; flex-direction: column; }
    .user-name { font-size: 0.8rem; font-weight: 500; color: #111817; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px; }
    .user-role { font-size: 0.7rem; color: #638884; }
    .logout-btn { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1rem; background: transparent; border: 1px solid #e5e7eb; border-radius: 8px; color: #638884; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .logout-btn:hover { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
    .main-content { flex: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; }
    .sidebar.collapsed .nav-item { justify-content: center; padding: 0.75rem; }
    .sidebar.collapsed .user-info { justify-content: center; }
    .sidebar.collapsed .logout-btn { justify-content: center; padding: 0.75rem; }

    /* Mobile Toggle & Overlay */
    .menu-btn { display: none; background: none; border: none; padding: 0.5rem; border-radius: 8px; cursor: pointer; color: #111817; }
    .menu-btn:hover { background: #f6f8f8; }
    .mobile-close { display: none; margin-left: auto; }
    .sidebar-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(2px); z-index: 998; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
    .sidebar-overlay.show { opacity: 1; visibility: visible; }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .sidebar { position: fixed; top: 0; left: 0; bottom: 0; z-index: 999; transform: translateX(-100%); box-shadow: none; width: 280px !important; }
      .sidebar.mobile-open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.15); }
      .menu-btn { display: flex; align-items: center; justify-content: center; }
      .sidebar .toggle-btn:not(.mobile-close) { display: none; }
      .mobile-close { display: block; }
    }
  `]
})
export class HelperLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  public readonly chatService = inject(ChatService);

  sidebarCollapsed = signal(false);
  currentUser = this.authService.currentUser;

  ngOnInit(): void {
    // Check if user is Helper
    if (this.authService.getUserRole() !== 'Helper') {
      this.router.navigate(['/']);
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  openChat(): void {
    this.chatService.toggleChat(!this.chatService.isChatOpen());
  }

  getUserInitials(): string {
    const email = this.currentUser()?.email || '';
    return email.charAt(0).toUpperCase();
  }

  getPageTitle(): string {
    // Simple mapping or use Route data. For now, simple return based on URL
    if (this.router.url.includes('/schedule')) return 'Lịch Làm Việc';
    if (this.router.url.includes('/jobs')) return 'Tìm Việc Mới';
    if (this.router.url.includes('/my-jobs')) return 'Công Việc Của Tôi';
    if (this.router.url.includes('/profile')) return 'Hồ Sơ Của Tôi';
    return 'Tổng Quan';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
