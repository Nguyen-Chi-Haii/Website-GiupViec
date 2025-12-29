import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ServiceResponse } from '@giupviec/shared';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/services`;

  /**
   * Get all services
   * GET /api/services
   */
  getAll(): Observable<ServiceResponse[]> {
    return this.http.get<ServiceResponse[]>(this.baseUrl);
  }

  /**
   * Get service by ID
   * GET /api/services/{id}
   */
  getById(id: number): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${this.baseUrl}/${id}`);
  }
}
