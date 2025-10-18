import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api';
import { catchError, tap } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER';
  organizationId: number;
  organization?: {
    id: number;
    name: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organizationName: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    // Check for existing tokens on service initialization
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (accessToken && refreshToken) {
      try {
        const user = this.getUserFromToken(accessToken);
        if (user && this.isTokenValid(accessToken)) {
          this.currentUserSubject.next(user);
          this.refreshTokenSubject.next(refreshToken);
        } else {
          // Token expired, try to refresh
          this.refreshAccessToken().subscribe({
            next: () => {
              // Token refreshed successfully
            },
            error: () => {
              // Refresh failed, clear tokens
              this.clearTokens();
            }
          });
        }
      } catch {
        this.clearTokens();
      }
    }
  }

  private getUserFromToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId,
        email: payload.email,
        name: payload.name || 'User', // Fallback name
        role: payload.role,
        organizationId: payload.organizationId,
        organization: payload.organization ? {
          id: payload.organization.id,
          name: payload.organization.name
        } : undefined
      };
    } catch {
      return null;
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.refreshTokenSubject.next(null);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => {
        console.log('AuthService: Login successful, setting user:', response.user);
        this.setTokens(response.accessToken, response.refreshToken);
        this.currentUserSubject.next(response.user);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    console.log('AuthService: Starting registration with data:', userData);
    return this.apiService.post<AuthResponse>('/auth/register', userData).pipe(
      tap(response => {
        console.log('AuthService: Registration successful, response:', response);
        this.setTokens(response.accessToken, response.refreshToken);
        this.currentUserSubject.next(response.user);
      }),
      catchError(error => {
        console.error('AuthService: Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    // Call logout endpoint (optional, for server-side token blacklisting)
    this.apiService.post('/auth/logout', {}).subscribe({
      next: () => {
        console.log('Logged out successfully');
      },
      error: (error) => {
        console.error('Logout error:', error);
      }
    });

    this.clearTokens();
    this.router.navigate(['/auth/login']);
  }

  refreshAccessToken(): Observable<TokenRefreshResponse> {
    const refreshToken = this.refreshTokenSubject.value;
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.apiService.post<TokenRefreshResponse>('/auth/refresh', { refreshToken }).pipe(
      tap(response => {
        this.setTokens(response.accessToken, response.refreshToken);
      }),
      catchError(error => {
        console.error('Token refresh error:', error);
        this.clearTokens();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    this.refreshTokenSubject.next(refreshToken);
    
    const user = this.getUserFromToken(accessToken);
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  isAuthenticated(): boolean {
    const accessToken = localStorage.getItem('access_token');
    return !!accessToken && !!this.currentUserSubject.value && this.isTokenValid(accessToken);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Method to check if token needs refresh (within 5 minutes of expiry)
  shouldRefreshToken(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      return timeUntilExpiry < 300; // 5 minutes
    } catch {
      return true;
    }
  }
}
