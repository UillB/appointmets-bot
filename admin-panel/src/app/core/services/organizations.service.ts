import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api';

export interface Organization {
  id: number;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  users?: User[];
  services?: Service[];
  _count?: {
    users: number;
    services: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER';
  createdAt?: string;
}

export interface Service {
  id: number;
  name: string;
  nameRu?: string;
  nameEn?: string;
  nameHe?: string;
  durationMin: number;
}

export interface CreateOrganizationRequest {
  name: string;
  avatar?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  avatar?: string;
}

export interface OrganizationsResponse {
  organizations: Organization[];
  isSuperAdmin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationsService {
  private organizationsSubject = new BehaviorSubject<Organization[]>([]);
  public organizations$ = this.organizationsSubject.asObservable();

  private isSuperAdminSubject = new BehaviorSubject<boolean>(false);
  public isSuperAdmin$ = this.isSuperAdminSubject.asObservable();

  constructor(private apiService: ApiService) {}

  // Get all organizations
  getOrganizations(): Observable<OrganizationsResponse> {
    return this.apiService.get<OrganizationsResponse>('/organizations').pipe(
      tap(response => {
        this.organizationsSubject.next(response.organizations);
        this.isSuperAdminSubject.next(response.isSuperAdmin);
      })
    );
  }

  // Get specific organization
  getOrganization(id: number): Observable<Organization> {
    return this.apiService.get<Organization>(`/organizations/${id}`);
  }

  // Create new organization (super admin only)
  createOrganization(data: CreateOrganizationRequest): Observable<{ message: string; organization: Organization }> {
    return this.apiService.post<{ message: string; organization: Organization }>('/organizations', data).pipe(
      tap(response => {
        // Add new organization to the list
        const currentOrganizations = this.organizationsSubject.value;
        this.organizationsSubject.next([response.organization, ...currentOrganizations]);
      })
    );
  }

  // Update organization
  updateOrganization(id: number, data: UpdateOrganizationRequest): Observable<{ message: string; organization: Organization }> {
    return this.apiService.put<{ message: string; organization: Organization }>(`/organizations/${id}`, data).pipe(
      tap(response => {
        // Update organization in the list
        const currentOrganizations = this.organizationsSubject.value;
        const updatedOrganizations = currentOrganizations.map(org => 
          org.id === id ? response.organization : org
        );
        this.organizationsSubject.next(updatedOrganizations);
      })
    );
  }

  // Delete organization (super admin only)
  deleteOrganization(id: number): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`/organizations/${id}`).pipe(
      tap(() => {
        // Remove organization from the list
        const currentOrganizations = this.organizationsSubject.value;
        const filteredOrganizations = currentOrganizations.filter(org => org.id !== id);
        this.organizationsSubject.next(filteredOrganizations);
      })
    );
  }

  // Upload avatar
  uploadAvatar(id: number, name: string): Observable<{ message: string; avatar: string }> {
    return this.apiService.post<{ message: string; avatar: string }>(`/organizations/${id}/avatar`, { name });
  }

  // Get current organizations from cache
  getCurrentOrganizations(): Organization[] {
    return this.organizationsSubject.value;
  }

  // Check if current user is super admin
  isCurrentUserSuperAdmin(): boolean {
    return this.isSuperAdminSubject.value;
  }

  // Clear cache
  clearCache(): void {
    this.organizationsSubject.next([]);
    this.isSuperAdminSubject.next(false);
  }
}
