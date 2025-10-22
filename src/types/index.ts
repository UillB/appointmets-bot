// API Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  chatId: string;
  serviceId: string;
  slotId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  service?: Service;
  slot?: Slot;
}

export interface Slot {
  id: string;
  serviceId: string;
  startAt: string;
  endAt: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  totalServices: number;
  totalRevenue: number;
}

// UI Types
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
  isActive?: boolean;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}