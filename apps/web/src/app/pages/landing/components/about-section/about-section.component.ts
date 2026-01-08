import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Stat {
  value: string;
  label: string;
  icon: string;
}

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.css'
})
export class AboutSectionComponent {
  stats: Stat[] = [
    { value: '10K+', label: 'Khách Hàng', icon: 'groups' },
    { value: '500+', label: 'Người Giúp Việc', icon: 'badge' },
    { value: '50K+', label: 'Lượt Đặt', icon: 'task_alt' }
  ];

  teamMembers: TeamMember[] = [
    { name: 'Nguyễn Thị Lan', role: 'Giúp việc 5 năm KN', avatar: '' },
    { name: 'Trần Văn Minh', role: 'Chăm sóc người già', avatar: '' },
    { name: 'Lê Thị Hương', role: 'Nấu ăn chuyên nghiệp', avatar: '' },
    { name: 'Phạm Văn Đức', role: 'Trông trẻ 3 năm KN', avatar: '' }
  ];

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
