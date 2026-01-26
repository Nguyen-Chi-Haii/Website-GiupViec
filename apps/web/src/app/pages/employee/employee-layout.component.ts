import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatService } from '../../core/services/chat.service';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent, FormsModule],
  templateUrl: './employee-layout.component.html',
  styleUrl: './employee-layout.component.css'
})
export class EmployeeLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private readonly chatService = inject(ChatService);

  searchQuery = '';

  sidebarCollapsed = signal(false);
  isMobileMenuOpen = signal(false);
  
  currentUser = this.authService.currentUser;

  ngOnInit(): void {
    if (this.authService.getUserRole() !== 'Employee') {
      this.router.navigate(['/']);
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }
  
  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  getUserInitials(): string {
    const email = this.currentUser()?.email || '';
    return email.charAt(0).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.notification.info(`Tìm kiếm: ${this.searchQuery}`);
    }
  }

  openChat(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.chatService.toggleChat(true);
    // Ensure connection is started if not already
    // The service handles connection state, but explicit start might be useful if lazy
    // this.chatService.startConnection(); 
  }
}
