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
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit {
  private readonly router = inject(Router);
  
  navItems: NavItem[] = [
    { label: 'Tổng Quan', icon: 'dashboard', route: '/admin' },
    { label: 'Quản Lý Đơn Hàng', icon: 'receipt_long', route: '/admin/bookings' },
    { label: 'Quản Lý Dịch Vụ', icon: 'mop', route: '/admin/services' },
    { label: 'Người Dùng', icon: 'group', route: '/admin/users' },
    { label: 'Người Giúp Việc', icon: 'handyman', route: '/admin/helpers' },
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
