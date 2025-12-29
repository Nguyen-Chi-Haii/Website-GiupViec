/**
 * User types matching API DTOs
 */

export enum UserRole {
  Customer = 'Customer',
  Helper = 'Helper',
  Admin = 'Admin'
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date | string;
}

export interface UserCreateDTO {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
}

export interface UserUpdateDTO {
  fullName?: string;
  phone?: string;
  avatar?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface RegisterDTO {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
}
