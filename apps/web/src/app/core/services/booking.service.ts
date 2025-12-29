import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookingCreateDTO, BookingResponseDTO } from '@giupviec/shared';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/bookings`;

  /**
   * Create a new booking
   * POST /api/bookings (requires auth)
   */
  create(dto: BookingCreateDTO): Observable<BookingResponseDTO> {
    return this.http.post<BookingResponseDTO>(this.baseUrl, dto);
  }

  /**
   * Get all bookings
   * GET /api/bookings
   */
  getAll(): Observable<BookingResponseDTO[]> {
    return this.http.get<BookingResponseDTO[]>(this.baseUrl);
  }

  /**
   * Get booking by ID
   * GET /api/bookings/{id}
   */
  getById(id: number): Observable<BookingResponseDTO> {
    return this.http.get<BookingResponseDTO>(`${this.baseUrl}/${id}`);
  }
}
