/**
 * Helper types matching API DTOs
 */

export interface HelperSuggestion {
  id: number;
  userId: number;
  fullName: string;
  avatar: string;
  ratingAverage: number;
  experienceYears: number;
  activeArea: string;
  bio: string;
  hourlyRate: number;
  ratingCount: number;
}

export interface HelperProfileResponse {
  id: number;
  userId: number;
  userName: string;
  avatar: string;
  ratingAverage: number;
  activeArea: string;
  bio: string;
  experienceYears: number;
  ratingCount: number;
  hourlyRate: number;
}

export interface RatingResponse {
  id: number;
  bookingId: number;
  customerId: number;
  customerName: string;
  helperId: number;
  helperName: string;
  score: number;
  comment: string;
  createdAt: string;
}

export interface RatingCreateDTO {
  bookingId: number;
  score: number;
  comment?: string;
}

export interface HelperProfileCreateDTO {
  userId: number;
  activeArea: string;
  bio?: string;
  experienceYears?: number;
}

export interface HelperProfileUpdateDTO {
  activeArea?: string;
  bio?: string;
  experienceYears?: number;
}

export interface AvailableHelperFilter {
  serviceId: number;
  startDate: string;
  endDate: string;
  workShiftStart: string;
  workShiftEnd: string;
}
