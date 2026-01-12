import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ServiceResponse } from '@giupviec/shared';
import { PagedResult } from '../models/paged-result.interface';

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
    return this.http.get<PagedResult<ServiceResponse>>(this.baseUrl).pipe(
      map(response => response.items)
    );
  }

  /**
   * Get service by ID
   * GET /api/services/{id}
   */
  getById(id: number): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${this.baseUrl}/${id}`);
  }
}
