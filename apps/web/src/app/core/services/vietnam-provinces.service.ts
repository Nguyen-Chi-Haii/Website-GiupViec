import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, shareReplay } from 'rxjs';
import { ProvinceResponse, WardResponse } from '../types/vietnam-provinces.types';

/**
 * Vietnam Provinces API v2 (After 2025 Reform)
 * - 34 provinces/cities (after merger)
 * - 2-tier structure: Province → Ward (no district level)
 */
const API_BASE_URL = 'https://provinces.open-api.vn/api/v2';

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
   */
  getProvinces(): Observable<ProvinceResponse[]> {
    if (!this.provincesCache$) {
      this.provincesCache$ = this.http.get<ProvinceResponse[]>(`${API_BASE_URL}/`).pipe(
        shareReplay(1),
        catchError((error) => {
          console.error('Failed to load provinces from API:', error);
          return of([]);
        })
      );
    }
    return this.provincesCache$;
  }

  /**
   * Get province by code with all wards
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
   * Search provinces
   */
  searchProvinces(query: string): Observable<ProvinceResponse[]> {
    return this.http.get<ProvinceResponse[]>(`${API_BASE_URL}/p/search/?q=${encodeURIComponent(query)}`).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Search wards
   */
  searchWards(query: string, provinceCode?: number): Observable<WardResponse[]> {
    let url = `${API_BASE_URL}/w/search/?q=${encodeURIComponent(query)}`;
    if (provinceCode) {
      url += `&p=${provinceCode}`;
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
