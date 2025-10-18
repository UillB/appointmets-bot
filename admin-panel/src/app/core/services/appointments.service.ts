import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Appointment, CreateAppointmentRequest } from '../../shared/models/api.models';

export interface AppointmentsFilters {
  status?: string;
  serviceId?: number;
  date?: Date;
  page?: number;
  limit?: number;
}

export interface AppointmentsResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  constructor(private api: ApiService) {}

  // Получить все записи с фильтрацией
  getAppointments(filters?: AppointmentsFilters): Observable<AppointmentsResponse> {
    const params: any = {};
    
    if (filters?.status) {
      params.status = filters.status;
    }
    if (filters?.serviceId) {
      params.serviceId = filters.serviceId.toString();
    }
    if (filters?.date) {
      params.date = filters.date.toISOString().split('T')[0];
    }
    if (filters?.page !== undefined) {
      params.page = filters.page.toString();
    }
    if (filters?.limit !== undefined) {
      params.limit = filters.limit.toString();
    }

    console.log('🚀 AppointmentsService: Making request with params:', params);
    console.log('🚀 AppointmentsService: Original filters:', filters);

    return this.api.get<AppointmentsResponse>('/appointments', { params });
  }

  // Создать новую запись
  createAppointment(appointment: CreateAppointmentRequest): Observable<Appointment> {
    return this.api.post<Appointment>('/appointments', appointment);
  }

  // Получить запись по ID
  getAppointment(id: number): Observable<Appointment> {
    return this.api.get<Appointment>(`/appointments/${id}`);
  }

  // Обновить запись
  updateAppointment(id: number, data: { status?: string }): Observable<Appointment> {
    return this.api.put<Appointment>(`/appointments/${id}`, data);
  }

  // Удалить запись
  deleteAppointment(id: number): Observable<void> {
    return this.api.delete<void>(`/appointments/${id}`);
  }
}
