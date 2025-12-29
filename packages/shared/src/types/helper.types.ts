/**
 * Helper types matching API DTOs
 */

export interface HelperSuggestion {
  userId: number;
  fullName: string;
  avatar: string;
  ratingAverage: number;
  experienceYears: number;
  activeArea: string;
  bio: string;
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
  startDate: Date | string;
  startTime: string;
  durationHours: number;
}
