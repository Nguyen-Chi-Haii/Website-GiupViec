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
    this.adminService.getAllServices(1, 50).subscribe({
      next: (result) => {
        this.services.set(result.items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
