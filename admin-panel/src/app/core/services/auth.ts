import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api';
import { TelegramWebAppService } from './telegram-webapp.service';
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
    private router: Router,
    private telegramWebApp: TelegramWebAppService
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
      } catch (error) {
        console.error('AuthService: checkStoredAuth error:', error);
        this.clearTokens();
      }
    }
  }

  private getUserFromToken(token: string): User | null {
    try {
      // Split token and get payload part
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }
      
      // Decode base64url (JWT uses base64url, not standard base64)
      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      const decodedPayload = JSON.parse(atob(padded));
      
      const user = {
        id: decodedPayload.userId,
        email: decodedPayload.email,
        name: decodedPayload.name || 'User', // Fallback name
        role: decodedPayload.role,
        organizationId: decodedPayload.organizationId,
        organization: decodedPayload.organization ? {
          id: decodedPayload.organization.id,
          name: decodedPayload.organization.name
        } : undefined
      };
      return user;
    } catch (error) {
      console.error('AuthService: getUserFromToken - error:', error);
      return null;
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }
      
      // Decode base64url (JWT uses base64url, not standard base64)
      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      const decodedPayload = JSON.parse(atob(padded));
      
      const currentTime = Date.now() / 1000;
      return decodedPayload.exp > currentTime;
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

  // Login via Telegram Web App initData
  loginWithTelegram(): Observable<AuthResponse> {
    if (!this.telegramWebApp.isInTelegram) {
      return throwError(() => new Error('Not in Telegram Web App'));
    }

    const user = this.telegramWebApp.currentUser;
    const initData = this.telegramWebApp.initData;
    if (!user || !initData) {
      return throwError(() => new Error('Telegram init data missing'));
    }

    return this.apiService.post<AuthResponse>('/auth/telegram-login', {
      telegramId: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      languageCode: user.language_code,
      initData
    }).pipe(
      tap(response => {
        this.setTokens(response.accessToken, response.refreshToken);
        this.currentUserSubject.next(response.user);
      }),
      catchError(error => {
        console.error('Telegram login error:', error);
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
    } else {
      console.error('AuthService: setTokens - failed to extract user from token');
    }
  }

  isAuthenticated(): boolean {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken || !this.isTokenValid(accessToken)) {
      return false;
    }
    
    // If we have a valid token but no user in subject, try to restore user from token
    if (!this.currentUserSubject.value) {
      const user = this.getUserFromToken(accessToken);
      if (user) {
        this.currentUserSubject.next(user);
      }
    }
    
    return !!this.currentUserSubject.value;
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
      const parts = accessToken.split('.');
      if (parts.length !== 3) {
        return true;
      }
      
      // Decode base64url (JWT uses base64url, not standard base64)
      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      const decodedPayload = JSON.parse(atob(padded));
      
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decodedPayload.exp - currentTime;
      return timeUntilExpiry < 300; // 5 minutes
    } catch {
      return true;
    }
  }
}
