// Базовые типы для API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Типы для услуг
export interface Service {
  id: number;
  name: string;
  nameRu?: string;
  nameEn?: string;
  nameHe?: string;
  description?: string;
  durationMin: number;
  price?: number;
  organizationId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  durationMin: number;
}

// Типы для слотов
export interface Slot {
  id: number;
  serviceId: number;
  startAt: string;
  endAt: string;
  capacity: number;
  bookings?: Appointment[];
  service?: Service;
}

export interface CreateSlotRequest {
  serviceId: number;
  startAt: string;
  endAt: string;
  capacity: number;
}

export interface GenerateSlotsRequest {
  serviceId: number;
  date: string; // YYYY-MM-DD
  startHour: number;
  endHour: number;
}

export interface SlotsQuery {
  serviceId?: number;
  from?: string;
  to?: string;
}

// Типы для записей
export interface Appointment {
  id: number;
  chatId: string;
  serviceId: number;
  slotId: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  service?: Service;
  slot?: Slot;
}

export interface CreateAppointmentRequest {
  chatId: string;
  serviceId: number;
  slotId: number;
}

// Типы для календаря
export interface CalendarAvailability {
  [day: number]: {
    total: number;
    available: number;
  };
}

// Типы для ошибок
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}