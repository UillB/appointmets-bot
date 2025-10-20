import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Slot, CreateSlotRequest, GenerateSlotsRequest, SlotsQuery, CalendarAvailability } from '../../shared/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class SlotsService {
  constructor(private api: ApiService) {}

  // Получить слоты с фильтрацией
  getSlots(query?: SlotsQuery): Observable<Slot[]> {
    return this.api.get<Slot[]>('/slots', query);
  }

  // Создать новый слот
  createSlot(slot: CreateSlotRequest): Observable<Slot> {
    return this.api.post<Slot>('/slots', slot);
  }

  // Сгенерировать слоты для услуги
  generateSlots(request: GenerateSlotsRequest): Observable<{ created: number }> {
    return this.api.post<{ created: number }>('/slots/generate', request);
  }

  // Получить доступность календаря
  getCalendarAvailability(serviceId: number, month: number, year: number): Observable<CalendarAvailability> {
    return this.api.get<CalendarAvailability>(`/webapp/calendar/availability`, {
      serviceId,
      month,
      year
    });
  }

  // Получить слоты со статусом (available/booked/conflict) для организации
  getSlotsStatus(params: { organizationId: number; serviceId?: number; date?: string; page?: number; limit?: number }): Observable<{ slots: (Slot & { status: string; isBooked: boolean; hasConflict: boolean })[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    return this.api.get<{ slots: (Slot & { status: string; isBooked: boolean; hasConflict: boolean })[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`/slots/status`, params);
  }

  // Получить слот по ID
  getSlot(id: number): Observable<Slot> {
    return this.api.get<Slot>(`/slots/${id}`);
  }

  // Удалить слот
  deleteSlot(id: number): Observable<void> {
    return this.api.delete<void>(`/slots/${id}`);
  }

  // Быстрая генерация слотов (совместимо с backend /slots/generate)
  generateSlotsAdvanced(request: { serviceId: number; startDate: string; endDate: string; startTime: string; endTime: string; includeWeekends?: boolean; lunchBreakStart?: string; lunchBreakEnd?: string; slotDuration: number; }): Observable<{ created: number }> {
    return this.api.post<{ created: number }>(`/slots/generate`, request);
  }
}
