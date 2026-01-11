import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, shareReplay } from 'rxjs';
import { ProvinceResponse, WardResponse } from '../types/vietnam-provinces.types';

/**
 * Vietnam Provinces API v2 (2025)
 * Structure: Province → Ward (2 levels)
 * 34 provinces after 2025 reform
 * 
 * Using proxy to bypass CORS: /api/provinces → provinces.open-api.vn/api/v2
 */
const API_BASE_URL = '/api/provinces';

@Injectable({
  providedIn: 'root'
})
export class VietnamProvincesService {
  private readonly http = inject(HttpClient);

  // Cache for provinces list
  private provincesCache$: Observable<ProvinceResponse[]> | null = null;
  // Cache for province details (with wards)
  private provinceDetailsCache = new Map<number, Observable<ProvinceResponse | null>>();

  /**
   * Get all provinces (34 provinces after 2025 reform)
   * Endpoint: GET /p/
   */
  getProvinces(): Observable<ProvinceResponse[]> {
    if (!this.provincesCache$) {
      // Sử dụng /p/ thay vì / để tránh lỗi
      this.provincesCache$ = this.http.get<ProvinceResponse[]>(`${API_BASE_URL}/p/`).pipe(
        shareReplay(1)
      );
    }
    
    return this.provincesCache$.pipe(
      catchError((error) => {
        console.error('Failed to load provinces from API:', error);
        // Clear cache so we can retry later
        this.provincesCache$ = null;
        return of([]);
      })
    );
  }

  /**
   * Get province by code with all wards
   * Endpoint: GET /p/{code}?depth=2
   */
  getProvinceWithWards(code: number): Observable<ProvinceResponse | null> {
    if (!this.provinceDetailsCache.has(code)) {
      const obs$ = this.http.get<ProvinceResponse>(`${API_BASE_URL}/p/${code}?depth=2`).pipe(
        shareReplay(1),
        catchError(() => of(null))
      );
      this.provinceDetailsCache.set(code, obs$);
    }
    return this.provinceDetailsCache.get(code)!;
  }

  /**
   * Get wards by province code
   */
  getWardsByProvince(provinceCode: number): Observable<WardResponse[]> {
    return this.getProvinceWithWards(provinceCode).pipe(
      map(province => province?.wards ?? [])
    );
  }

  /**
   * Search wards with optional province filter
   * Endpoint: GET /w/?province={code}&search={query}
   */
  searchWards(query: string, provinceCode?: number): Observable<WardResponse[]> {
    let url = `${API_BASE_URL}/w/?search=${encodeURIComponent(query)}`;
    if (provinceCode) {
      url += `&province=${provinceCode}`;
    }
    return this.http.get<WardResponse[]>(url).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.provincesCache$ = null;
    this.provinceDetailsCache.clear();
  }
}
