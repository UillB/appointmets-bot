// API Service for Appointments Bot Admin Panel
// Integrates with existing backend on port 4000

const API_BASE_URL = 'http://localhost:4000/api';

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  organizationId: number;
  organization?: {
    id: number;
    name: string;
  };
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Appointment {
  id: number;
  clientName: string;
  clientPhone: string;
  service: {
    id: number;
    name: string;
    durationMin: number;
    price?: number;
    currency?: string;
  };
  slot: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

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
  currency?: string;
  organizationId: number;
  organization?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: number;
  name: string;
  description?: string;
  address?: string;
  workingHours?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  botToken?: string;
  botUsername?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  id: number;
  serviceId: number;
  service: {
    id: number;
    name: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookingsCount: number;
  status: 'available' | 'booked' | 'unavailable';
  createdAt: string;
  updatedAt: string;
}

export interface AIConfig {
  id: number;
  organizationId: number;
  provider: 'openai' | 'anthropic' | 'google';
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  instructions: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.accessToken = localStorage.getItem('accessToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as any).Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.accessToken = response.accessToken;
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  }

  async register(
    email: string,
    password: string,
    name: string,
    organizationName: string
  ): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        name,
        organizationName,
      }),
    });

    this.accessToken = response.accessToken;
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    this.accessToken = response.accessToken;
    localStorage.setItem('accessToken', response.accessToken);

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      this.accessToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  // Appointments methods
  async getAppointments(params?: {
    status?: string;
    serviceId?: number;
    date?: string;
    page?: number;
    limit?: number;
  }): Promise<{ appointments: Appointment[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.serviceId) searchParams.set('serviceId', params.serviceId.toString());
    if (params?.date) searchParams.set('date', params.date);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/appointments${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getAppointment(id: number): Promise<Appointment> {
    return this.request(`/appointments/${id}`);
  }

  async updateAppointmentStatus(
    id: number,
    status: 'pending' | 'confirmed' | 'cancelled',
    notes?: string
  ): Promise<Appointment> {
    return this.request(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async deleteAppointment(id: number): Promise<void> {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Services methods
  async getServices(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ services: Service[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/services${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getService(id: number): Promise<Service> {
    return this.request(`/services/${id}`);
  }

  async createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(service),
    });
  }

  async updateService(id: number, service: Partial<Service>): Promise<Service> {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service),
    });
  }

  async deleteService(id: number): Promise<void> {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // Organizations methods
  async getOrganizations(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ organizations: Organization[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/organizations${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getOrganization(id: number): Promise<Organization> {
    return this.request(`/organizations/${id}`);
  }

  async createOrganization(organization: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    return this.request('/organizations', {
      method: 'POST',
      body: JSON.stringify(organization),
    });
  }

  async updateOrganization(id: number, organization: Partial<Organization>): Promise<Organization> {
    return this.request(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(organization),
    });
  }

  async deleteOrganization(id: number): Promise<void> {
    return this.request(`/organizations/${id}`, {
      method: 'DELETE',
    });
  }

  // Slots methods
  async getSlots(params?: {
    serviceId?: number;
    date?: string;
    page?: number;
    limit?: number;
  }): Promise<{ slots: Slot[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams();
    if (params?.serviceId) searchParams.set('serviceId', params.serviceId.toString());
    if (params?.date) searchParams.set('date', params.date);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/slots${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async generateSlots(params: {
    serviceId: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    intervalMinutes: number;
    capacity: number;
  }): Promise<{ message: string; slotsCreated: number }> {
    return this.request('/slots/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async deleteSlot(id: number): Promise<void> {
    return this.request(`/slots/${id}`, {
      method: 'DELETE',
    });
  }

  // Bot Management methods
  async getBotConfig(): Promise<{
    botToken?: string;
    botUsername?: string;
    webhookUrl?: string;
    isActive: boolean;
  }> {
    return this.request('/bot/config');
  }

  async updateBotConfig(config: {
    botToken?: string;
    webhookUrl?: string;
    isActive?: boolean;
  }): Promise<{ message: string }> {
    return this.request('/bot/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async testBot(): Promise<{ message: string; success: boolean }> {
    return this.request('/bot/test', {
      method: 'POST',
    });
  }

  // AI Config methods
  async getAIConfig(): Promise<AIConfig | null> {
    return this.request('/ai-config');
  }

  async updateAIConfig(config: Partial<AIConfig>): Promise<AIConfig> {
    return this.request('/ai-config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async testAI(message: string): Promise<{ response: string; success: boolean }> {
    return this.request('/ai-config/test', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalAppointments: number;
    todayAppointments: number;
    weekAppointments: number;
    pendingAppointments: number;
    totalServices: number;
    activeServices: number;
    totalRevenue: number;
    todayRevenue: number;
  }> {
    // Since backend doesn't have dedicated dashboard endpoint, we'll aggregate from existing endpoints
    const [appointments, services, organizations] = await Promise.all([
      this.getAppointments(),
      this.getServices(),
      this.getOrganizations()
    ]);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayAppointments = appointments.appointments.filter((apt: any) => {
      const aptDate = new Date(apt.slot?.startAt || apt.createdAt || '');
      return aptDate >= today;
    }).length;

    const weekAppointments = appointments.appointments.filter((apt: any) => {
      const aptDate = new Date(apt.slot?.startAt || apt.createdAt || '');
      return aptDate >= weekAgo;
    }).length;

    const pendingAppointments = appointments.appointments.filter((apt: any) => 
      apt.status === 'pending'
    ).length;

    return {
      totalAppointments: appointments.total,
      todayAppointments,
      weekAppointments,
      pendingAppointments,
      totalServices: services.total,
      activeServices: services.total, // All services are considered active for now
      totalRevenue: 0, // TODO: Implement revenue calculation
      todayRevenue: 0  // TODO: Implement revenue calculation
    };
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export types are already exported above as interfaces
