import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ServiceService } from '../../../core/services/service.service';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { ServiceResponse } from '@giupviec/shared';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-booking-step1',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './step1-service.component.html',
  styleUrl: './step1-service.component.css'
})
export class BookingStep1Component implements OnInit {
  private readonly serviceService = inject(ServiceService);
  private readonly bookingState = inject(BookingStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly authService = inject(AuthService);

  services: ServiceResponse[] = [];
  isLoading = true;
  selectedServiceId: number | null = null;

  get backLink(): string {
    return this.authService.isAuthenticated() ? '/customer' : '/';
  }

  ngOnInit(): void {
    this.bookingState.setCurrentStep(1);
    
    // Restore selected service if exists
    const selected = this.bookingState.selectedService();
    if (selected) {
      this.selectedServiceId = selected.id;
    }

    this.loadServices();
  }

  private loadServices(): void {
    this.serviceService.getAll().subscribe({
      next: (services) => {
        this.services = services.filter(s => s.isActive);
        this.isLoading = false;

        // Check for query param to pre-select and move to step 2
        this.route.queryParams.subscribe(params => {
          const serviceId = params['serviceId'];
          if (serviceId) {
            const service = this.services.find(s => s.id === +serviceId);
            if (service) {
              this.selectService(service);
              this.onNext();
            }
          }
        });
      },
      error: (err) => {
        console.error('Error loading services:', err);
        // Fallback to default services
        this.services = [
          { id: 1, name: 'Dọn Dẹp Nhà Cửa', price: 60000, isActive: true },
          { id: 2, name: 'Tổng Vệ Sinh', price: 15000, isActive: true },
          { id: 3, name: 'Giặt Sofa & Rèm', price: 300000, isActive: true }
        ];
        this.isLoading = false;
      }
    });
  }

  selectService(service: ServiceResponse): void {
    this.selectedServiceId = service.id;
    this.bookingState.setSelectedService(service);
  }

  isSelected(service: ServiceResponse): boolean {
    return this.selectedServiceId === service.id;
  }

  onNext(): void {
    if (this.bookingState.canProceedToStep2()) {
      this.router.navigate(['/booking/step2']);
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }

  getServiceIcon(serviceName: string): string {
    const name = serviceName.toLowerCase();
    if (name.includes('dọn') || name.includes('nhà')) return 'home';
    if (name.includes('tổng') || name.includes('vệ sinh')) return 'cleaning_services';
    if (name.includes('giặt') || name.includes('sofa')) return 'dry_cleaning';
    if (name.includes('máy lạnh') || name.includes('điều hòa')) return 'ac_unit';
    return 'handyman';
  }
}
