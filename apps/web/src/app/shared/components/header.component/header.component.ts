import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() activeSection = '';
  
  isMenuOpen = false;

  readonly navLinks = [
    { label: 'Dịch Vụ', href: '#services' },
    { label: 'Việc Làm', href: '#jobs' },
    { label: 'Giới Thiệu', href: '#about' }
  ];

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  scrollTo(id: string): void {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.isMenuOpen = false;
  }

  isActive(href: string): boolean {
    return this.activeSection === href;
  }
}
