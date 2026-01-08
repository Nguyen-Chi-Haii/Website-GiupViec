/**
 * Service types matching API DTOs
 */

export type ServiceUnit = 'Hour' | 'Piece' | 'm2' | 'Session';

export interface ServiceResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  unit: ServiceUnit;
  unitLabel?: string;
  minQuantity: number;
  requiresNotes: boolean;
  notePrompt?: string;
  icon?: string;
  isActive: boolean;
}

export interface ServiceCreateDTO {
  name: string;
  description?: string;
  price: number;
  unit: ServiceUnit;
  unitLabel?: string;
  minQuantity?: number;
  requiresNotes?: boolean;
  notePrompt?: string;
  icon?: string;
  isActive?: boolean;
}

export interface ServiceUpdateDTO {
  name?: string;
  description?: string;
  price?: number;
  unit?: ServiceUnit;
  unitLabel?: string;
  minQuantity?: number;
  requiresNotes?: boolean;
  notePrompt?: string;
  icon?: string;
  isActive?: boolean;
}
