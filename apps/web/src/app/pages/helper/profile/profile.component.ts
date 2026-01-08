import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

import { AddressSelectorComponent, AddressResult } from '../../../shared/components/address-selector/address-selector.component';

interface HelperProfile {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  avatar: string;
  bio: string;
  experienceYears: number;
  activeArea: string;
  ratingAverage: number;
}

@Component({
  selector: 'app-helper-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressSelectorComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class HelperProfileComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  isLoading = signal(true);
  isSaving = signal(false);
  profile = signal<HelperProfile | null>(null);
  successMessage = signal('');
  errorMessage = signal('');

  formData = {
    bio: '',
    activeArea: '',
    experienceYears: 0
  };

  ngOnInit(): void {
    this.loadProfile();
  }

  userEmail(): string {
    return this.authService.currentUser()?.email || '';
  }

  getInitials(): string {
    const name = this.profile()?.fullName || this.userEmail();
    return name.charAt(0).toUpperCase();
  }

  getExperience(): string {
    const years = this.profile()?.experienceYears;
    if (years === undefined) return 'Chưa cập nhật';
    if (years < 1) return 'Dưới 1 năm kinh nghiệm';
    return `${years} năm kinh nghiệm`;
  }

  loadProfile(): void {
    const userId = this.authService.currentUser()?.nameid;
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.http.get<HelperProfile>(`${environment.apiUrl}/helperprofiles/user/${userId}`).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.formData = {
          bio: data.bio || '',
          activeArea: data.activeArea || '',
          experienceYears: data.experienceYears || 0
        };
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  saveProfile(): void {
    const userId = this.authService.currentUser()?.nameid;
    if (!userId) return;

    this.isSaving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.http.put(`${environment.apiUrl}/helperprofiles/user/${userId}`, {
      bio: this.formData.bio,
      activeArea: this.formData.activeArea,
      experienceYears: this.formData.experienceYears
    }).subscribe({
      next: () => {
        this.successMessage.set('Cập nhật hồ sơ thành công!');
        this.isSaving.set(false);
        this.loadProfile();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Có lỗi xảy ra');
        this.isSaving.set(false);
      }
    });
  }

  onAddressChange(result: AddressResult): void {
    this.formData.activeArea = result.fullAddress;
  }
}
