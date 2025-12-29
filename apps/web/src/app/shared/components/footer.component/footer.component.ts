import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();

  readonly services = [
    { label: 'Dọn dẹp nhà', href: '#' },
    { label: 'Tổng vệ sinh', href: '#' },
    { label: 'Giặt ủi', href: '#' },
    { label: 'Vệ sinh máy lạnh', href: '#' }
  ];

  readonly company = [
    { label: 'Về chúng tôi', href: '#' },
    { label: 'Tuyển dụng', href: '#' },
    { label: 'Điều khoản sử dụng', href: '#' },
    { label: 'Chính sách bảo mật', href: '#' }
  ];

  readonly contact = {
    address: '123 Đường ABC, Quận 1, TP.HCM',
    phone: '1900 1234 56',
    email: 'support@giupviecnha.vn'
  };
}
