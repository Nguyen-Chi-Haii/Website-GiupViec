/**
 * Service types matching API DTOs
 */

export interface ServiceResponse {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
}

export interface ServiceCreateDTO {
  name: string;
  price: number;
  isActive?: boolean;
}

export interface ServiceUpdateDTO {
  name?: string;
  price?: number;
  isActive?: boolean;
}
