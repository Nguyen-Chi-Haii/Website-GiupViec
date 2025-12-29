import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HelperSuggestion, HelperProfileResponse, AvailableHelperFilter } from '@giupviec/shared';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/helperprofiles`;

  /**
   * Get helper profile by user ID
   * GET /api/helperprofiles/user/{userId}
   */
  getByUserId(userId: number): Observable<HelperProfileResponse> {
    return this.http.get<HelperProfileResponse>(`${this.baseUrl}/user/${userId}`);
  }

  /**
   * Get available helpers for booking
   * POST /api/helperprofiles/available
   */
  getAvailableHelpers(filter: AvailableHelperFilter): Observable<HelperSuggestion[]> {
    return this.http.post<HelperSuggestion[]>(`${this.baseUrl}/available`, filter);
  }
}
