import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api';

export interface Service {
  id: number;
  name: string;
  nameRu?: string;
  nameEn?: string;
  nameHe?: string;
  description?: string;
  descriptionRu?: string;
  descriptionEn?: string;
  descriptionHe?: string;
  durationMin: number;
  price?: number;
  organizationId: number;
  organization?: {
    id: number;
    name: string;
  };
  slots?: Slot[];
  _count?: {
    slots: number;
    appointments: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Slot {
  id: number;
  startAt: string;
  endAt: string;
  capacity: number;
  _count?: {
    bookings: number;
  };
}

export interface CreateServiceRequest {
  name: string;
  nameRu?: string;
  nameEn?: string;
  nameHe?: string;
  description?: string;
  descriptionRu?: string;
  descriptionEn?: string;
  descriptionHe?: string;
  durationMin: number;
  organizationId?: number; // Optional for super admin
}

export interface UpdateServiceRequest {
  name?: string;
  nameRu?: string;
  nameEn?: string;
  nameHe?: string;
  description?: string;
  descriptionRu?: string;
  descriptionEn?: string;
  descriptionHe?: string;
  durationMin?: number;
}

export interface ServicesResponse {
  services: Service[];
  isSuperAdmin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private servicesSubject = new BehaviorSubject<Service[]>([]);
  public services$ = this.servicesSubject.asObservable();

  private isSuperAdminSubject = new BehaviorSubject<boolean>(false);
  public isSuperAdmin$ = this.isSuperAdminSubject.asObservable();

  constructor(private apiService: ApiService) {}

  // Get all services
  getServices(organizationId?: number): Observable<ServicesResponse> {
    const params = organizationId ? { organizationId: organizationId.toString() } : {};
    return this.apiService.get<ServicesResponse>('/services', { params }).pipe(
      tap(response => {
        this.servicesSubject.next(response.services);
        this.isSuperAdminSubject.next(response.isSuperAdmin);
      })
    );
  }

  // Get specific service
  getService(id: number): Observable<Service> {
    return this.apiService.get<Service>(`/services/${id}`);
  }

  // Create new service
  createService(data: CreateServiceRequest): Observable<{ message: string; service: Service }> {
    return this.apiService.post<{ message: string; service: Service }>('/services', data).pipe(
      tap(response => {
        // Add new service to the list
        const currentServices = this.servicesSubject.value;
        this.servicesSubject.next([response.service, ...currentServices]);
      })
    );
  }

  // Update service
  updateService(id: number, data: UpdateServiceRequest): Observable<{ message: string; service: Service }> {
    return this.apiService.put<{ message: string; service: Service }>(`/services/${id}`, data).pipe(
      tap(response => {
        // Update service in the list
        const currentServices = this.servicesSubject.value;
        const updatedServices = currentServices.map(service => 
          service.id === id ? response.service : service
        );
        this.servicesSubject.next(updatedServices);
      })
    );
  }

  // Delete service
  deleteService(id: number): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`/services/${id}`).pipe(
      tap(() => {
        // Remove service from the list
        const currentServices = this.servicesSubject.value;
        const filteredServices = currentServices.filter(service => service.id !== id);
        this.servicesSubject.next(filteredServices);
      })
    );
  }

  // Get localized service name
  getLocalizedName(service: Service, language: string = 'en'): string {
    switch (language) {
      case 'ru':
        return service.nameRu || service.name;
      case 'he':
        return service.nameHe || service.name;
      case 'en':
      default:
        return service.nameEn || service.name;
    }
  }

  // Get localized service description
  getLocalizedDescription(service: Service, language: string = 'en'): string {
    switch (language) {
      case 'ru':
        return service.descriptionRu || service.description || '';
      case 'he':
        return service.descriptionHe || service.description || '';
      case 'en':
      default:
        return service.descriptionEn || service.description || '';
    }
  }

  // Format duration in minutes to human readable format
  formatDuration(durationMin: number): string {
    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  // Get services by organization
  getServicesByOrganization(organizationId: number): Service[] {
    return this.servicesSubject.value.filter(service => service.organizationId === organizationId);
  }

  // Get current services from cache
  getCurrentServices(): Service[] {
    return this.servicesSubject.value;
  }

  // Check if current user is super admin
  isCurrentUserSuperAdmin(): boolean {
    return this.isSuperAdminSubject.value;
  }

  // Clear cache
  clearCache(): void {
    this.servicesSubject.next([]);
    this.isSuperAdminSubject.next(false);
  }
}