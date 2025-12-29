import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-why-choose-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './why-choose-us.component.html',
  styleUrl: './why-choose-us.component.css'
})
export class WhyChooseUsComponent {
  readonly features: Feature[] = [
    {
      icon: 'verified_user',
      title: 'An Toàn Tuyệt Đối',
      description: 'Nhân viên có lý lịch rõ ràng, được xác minh danh tính và sức khỏe đầy đủ.'
    },
    {
      icon: 'payments',
      title: 'Giá Cả Rõ Ràng',
      description: 'Minh bạch về chi phí, hiển thị ngay trên ứng dụng, không thu thêm phụ phí.'
    },
    {
      icon: 'school',
      title: 'Đào Tạo Bài Bản',
      description: 'Quy trình làm việc chuyên nghiệp, nhân viên được đào tạo kỹ năng vệ sinh chuẩn.'
    },
    {
      icon: 'support_agent',
      title: 'Hỗ Trợ 24/7',
      description: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng giải quyết mọi vấn đề phát sinh.'
    }
  ];
}
