import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  number: number;
  title: string;
  description: string;
  isActive: boolean;
}

@Component({
  selector: 'app-booking-process',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-process.component.html',
  styleUrl: './booking-process.component.css'
})
export class BookingProcessComponent {
  readonly steps: Step[] = [
    {
      number: 1,
      title: 'Chọn Dịch Vụ',
      description: 'Lựa chọn gói dịch vụ phù hợp với nhu cầu của bạn.',
      isActive: true
    },
    {
      number: 2,
      title: 'Chọn Thời Gian & Địa Điểm',
      description: 'Đặt lịch hẹn theo thời gian rảnh của bạn.',
      isActive: false
    },
    {
      number: 3,
      title: 'Xác Nhận & Thanh Toán',
      description: 'Thanh toán an toàn qua nhiều hình thức linh hoạt.',
      isActive: false
    },
    {
      number: 4,
      title: 'Tận Hưởng Không Gian Sạch',
      description: 'Nhân viên đến làm việc và bạn nghiệm thu kết quả.',
      isActive: false
    }
  ];
}
