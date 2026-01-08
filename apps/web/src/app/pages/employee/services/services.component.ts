import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, ServiceResponse } from '../../../core/services/admin.service';

@Component({
  selector: 'app-employee-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class EmployeeServicesComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  
  services = signal<ServiceResponse[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.adminService.getAllServices().subscribe({
      next: (data) => {
        this.services.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
