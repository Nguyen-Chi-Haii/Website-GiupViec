import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RatingCreateDTO, RatingResponse } from '@giupviec/shared';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ratings`;

  /**
   * Submit a new rating for a booking
   * POST /api/ratings
   */
  createRating(dto: RatingCreateDTO): Observable<RatingResponse> {
    return this.http.post<RatingResponse>(this.baseUrl, dto);
  }

  /**
   * Get ratings for a specific helper
   * GET /api/ratings/helper/{helperId}
   */
  getRatingsByHelperId(helperId: number): Observable<RatingResponse[]> {
    return this.http.get<RatingResponse[]>(`${this.baseUrl}/helper/${helperId}`);
  }
}
