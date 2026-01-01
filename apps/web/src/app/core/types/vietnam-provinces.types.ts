/**
 * Vietnam Administrative Divisions API Types - v2 (2025)
 * Based on https://provinces.open-api.vn/api/v2/
 * 
 * After 2025 reform: 34 provinces/cities
 * Structure: Province → Ward (2 levels only)
 */

export type VietNamDivisionType = 
  | 'tỉnh' 
  | 'thành phố trung ương' 
  | 'xã' 
  | 'thị trấn' 
  | 'phường'
  | 'đặc khu';

export interface WardResponse {
  name: string;
  code: number;
  division_type: VietNamDivisionType;
  codename: string;
  province_code: number;
}

export interface ProvinceResponse {
  name: string;
  code: number;
  division_type: VietNamDivisionType;
  codename: string;
  phone_code: number;
  wards?: WardResponse[];
}

export interface SearchResult {
  name: string;
  code: number;
  matches?: Record<string, [number, number]>;
  score?: number;
}
