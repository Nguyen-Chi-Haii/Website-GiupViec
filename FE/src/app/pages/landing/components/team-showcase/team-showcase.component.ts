import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Helper {
  name: string;
  avatar: string;
  rating: number;
  experience: string;
  badge: string;
}

@Component({
  selector: 'app-team-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-showcase.component.html',
  styleUrl: './team-showcase.component.css'
})
export class TeamShowcaseComponent {
  readonly helpers: Helper[] = [
    {
      name: 'Nguyễn Thị Lan',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7IXdrPhy94N_-NqY4NyvOiAp7p45lq59egMPzQq3ZLvI0SduIpDZec1BFvZcaGHpxF7aWKIXjtPEcMo9op0-vNs1q3pedUkuRhLA-iTN5bM6ilVoD4yyTcHqWvQLfthwGm5OXGgEx10G4Wp5oaQTqRKWU344c6I6dgjK1Al7MKK6NED9b3HebUtnqJuWtJ2duckb6rgfOazK2Y1b9e1a409047KQJ_c6eKoXausK3SEXGWZc9J8hF_kIAR25cjdmjnfE0STO637Y',
      rating: 4.9,
      experience: '5 năm kinh nghiệm',
      badge: 'Đã tiêm vaccine'
    },
    {
      name: 'Trần Văn Minh',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv94qmjEuxCy4HNTOZZGjS_F-mbmY4qqw4wkfoF-Y0kzdse8MQ6QZemBaHWRORulQTwnLp03mLD0dcUGikVYkB74_3Ys4CuTqxFvh3yg2oOJ5hpzrCgc18zyK0Dr0ZvUhUHFquHJq2U4gXXaPr14qH1qc6BEv01Ybc2kH49lvqwYyplY1K7qEPbHJf9bzjL3o5V0b2XVNfF1vNyMAM8qbSvT9N1uxFlDZyEq2Gu8J5U8ptfz7DfT-fR8jfX77Cgas3G6nfauVhQuY',
      rating: 5.0,
      experience: '3 năm kinh nghiệm',
      badge: 'Chuyên lau kính'
    },
    {
      name: 'Lê Thị Mai',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcdg-fG-FcPBmYUUYQBKgOKEJSZF3TnqQoW_fSV9GzaPUIDUCcqsu_U9EN-JtkHl6nn67F0nkjURzm2w6cCKEi0cpz0ZNMoLsKSr05jzeFPVSIsC_wNEH4Md_dxBMZugDcLk1bBGUfzFCOb-A3rokbkFasiU5mmR8-uMUmtmTcb8jSQ5oK03VGl-jws3oX0Yh-44KColheyhQWT0UobQAqAPjSzUZ8Ozvoi8yf-FYcd16ech29sdoFN73o3jnX1XBvjAKbyrnShpY',
      rating: 4.8,
      experience: '7 năm kinh nghiệm',
      badge: 'Nấu ăn ngon'
    },
    {
      name: 'Phạm Thị Hoa',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBd04x8K3R5ADa2tn9fEwq1Juc1UJCWjjy9LQU_ZDU7Q0Z9yF7qtBX34QCSK0Sf915kILOzd0iZKsp29DOyuNaPwau63HPCPYLGEcSTac7gjqdtWY-tLA4th7FJb7UHNjv4b_PWDFEFCqziphtya4lCp4fqCs_28AWJcMQZklnzAKfAQ04nu-Xkb9HIyePeKSyCJGMZfXl0KnpABkzgN5zHx12F3RI06OuGckIJtnkR3tBnlPcrUA-rLxw6gPOvuf1RbHYsnd0q0co',
      rating: 4.9,
      experience: '4 năm kinh nghiệm',
      badge: 'Chăm chỉ'
    }
  ];
}
