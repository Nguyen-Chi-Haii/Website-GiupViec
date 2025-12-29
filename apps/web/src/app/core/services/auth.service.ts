import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginDTO, RegisterDTO, UserResponse, UserRole } from '@giupviec/shared';

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse extends UserResponse {}

export interface DecodedToken {
  nameid: string;  // User ID from ClaimTypes.NameIdentifier
  email: string;
  role: string;    // User Role from ClaimTypes.Role
  exp: number;
  iss: string;
  aud: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  // Current user state
  currentUser = signal<DecodedToken | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    // Check for existing token on initialization
    this.checkAuth();
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  login(dto: LoginDTO): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, dto).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        const decoded = this.decodeToken(response.token);
        this.currentUser.set(decoded);
        this.isAuthenticated.set(true);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Register new user
   * POST /api/auth/register
   */
  register(dto: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
    role: UserRole;
    status: number;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, dto).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  /**
   * Check if user is authenticated
   */
  private checkAuth(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.decodeToken(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        this.currentUser.set(decoded);
        this.isAuthenticated.set(true);
      } else {
        // Token expired, clear it
        this.logout();
      }
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Decode JWT token to get user info
   */
  decodeToken(token: string): DecodedToken | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return {
        nameid: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.nameid,
        email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email,
        role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role,
        exp: decoded.exp,
        iss: decoded.iss,
        aud: decoded.aud
      };
    } catch {
      return null;
    }
  }

  /**
   * Get user role from token
   */
  getUserRole(): string | null {
    return this.currentUser()?.role || null;
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.getUserRole() === 'Admin';
  }

  /**
   * Get redirect path based on user role
   */
  getRedirectPath(): string {
    const role = this.getUserRole();
    switch (role) {
      case 'Admin':
        return '/admin';
      case 'Employee':
        return '/employee';
      case 'Helper':
        return '/helper';
      case 'Customer':
        return '/customer';
      default:
        return '/';
    }
  }
}
