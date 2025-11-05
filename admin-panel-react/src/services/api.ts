// API Service for Appointments Bot Admin Panel
// Integrates with existing backend on port 4000

// Determine API base URL dynamically based on current origin
// This allows the app to work both locally (localhost) and via ngrok (HTTPS)
const getApiBaseUrl = () => {
  // In production or when accessed via ngrok, use relative path
  if (window.location.protocol === 'https:' || window.location.hostname !== 'localhost') {
    const apiUrl = '/api';
    console.log('🌐 API Base URL (relative):', apiUrl, 'from origin:', window.location.origin);
    return apiUrl;
  }
  // For local development, use localhost
  const apiUrl = 'http://localhost:4000/api';
  console.log('🌐 API Base URL (localhost):', apiUrl);
  return apiUrl;
};

const API_BASE_URL = getApiBaseUrl();

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
  chatId: string;
  serviceId: number;
  slotId: number;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  service: {
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
  };
  slot: {
    id: number;
    serviceId: number;
    startAt: string;
    endAt: string;
    capacity: number;
  };
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
  startAt: string;
  endAt: string;
  capacity: number;
  status?: 'available' | 'booked' | 'conflict';
  isBooked?: boolean;
  hasConflict?: boolean;
  service: {
    id: number;
    name: string;
    durationMin: number;
    organizationId: number;
  };
}

export interface SlotGenerationRequest {
  serviceId: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  includeWeekends: boolean;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
  slotDuration: number;
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
    // Always get fresh token from localStorage (in case it was updated)
    const currentToken = localStorage.getItem('accessToken');
    if (currentToken) {
      this.accessToken = currentToken;
    }
    
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
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        // Backend возвращает { error: '...' } или { message: '...' }
        errorMessage = errorData.error || errorData.message || errorMessage;
        // Для 401 делаем сообщение более понятным
        if (response.status === 401) {
          errorMessage = errorData.error === 'Invalid credentials' 
            ? 'Неверный email или пароль' 
            : (errorData.error || errorData.message || 'Неверный email или пароль');
        }
      } catch (e) {
        // Если ответ не JSON, используем статус код
        if (response.status === 401) {
          errorMessage = 'Неверный email или пароль';
        } else if (response.status === 400) {
          errorMessage = 'Неверные данные';
        }
      }
      throw new Error(errorMessage);
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

  async telegramLogin(initData: string, telegramUser: any): Promise<AuthResponse> {
    console.log('📤 Sending telegram-login request:', {
      telegramId: telegramUser.id,
      username: telegramUser.username,
      hasInitData: !!initData,
      initDataLength: initData?.length
    });
    
    const response = await this.request<AuthResponse>('/auth/telegram-login', {
      method: 'POST',
      body: JSON.stringify({
        telegramId: telegramUser.id.toString(),
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
        languageCode: telegramUser.language_code,
        initData: initData,
      }),
    });

    console.log('📥 Telegram login response received:', {
      userId: response.user.id,
      email: response.user.email,
      role: response.user.role
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

  async createAppointment(appointment: { chatId: string; serviceId: number; slotId: number }): Promise<Appointment> {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
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


  async getServicesStats(): Promise<{
    totalServices: number;
    totalAppointments: number;
    todayAppointments: number;
    weekAppointments: number;
    pendingAppointments: number;
    averageOccupancy: number;
    totalRevenue: number;
    todayRevenue: number;
  }> {
    return this.request('/services/stats');
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

  // Slot expiration and renewal
  async getSlotStatus(serviceId: number): Promise<{
    needsRenewal: boolean;
    daysUntilExpiry: number;
    latestSlotDate: string;
    message: string;
  }> {
    return this.request(`/services/${serviceId}/slots/status`);
  }

  async renewSlots(serviceId: number): Promise<{
    message: string;
    slotsCreated: number;
    serviceId: number;
  }> {
    return this.request(`/services/${serviceId}/slots/renew`, {
      method: 'POST',
    });
  }

  // Service deletion with safety checks (check only, doesn't delete)
  async deleteServiceWithCheck(serviceId: number): Promise<{
    safeToDelete?: boolean;
    error?: string;
    details?: {
      totalAppointments: number;
      futureAppointments: number;
      nextAppointmentDate?: string;
      nextAppointmentTime?: string;
      totalSlots?: number;
      message: string;
    };
  }> {
    return await this.request(`/services/${serviceId}/deletion-check`, {
      method: 'GET',
    });
  }

  // Actually delete service (safe delete - only if no future appointments)
  async deleteService(serviceId: number): Promise<{
    message: string;
  }> {
    return await this.request(`/services/${serviceId}`, {
      method: 'DELETE',
    });
  }

  async forceDeleteService(serviceId: number): Promise<{
    message: string;
    deletedAppointments: number;
    deletedSlots: number;
    serviceId: number;
  }> {
    return this.request(`/services/${serviceId}/force`, {
      method: 'DELETE',
      body: JSON.stringify({ confirmDelete: true }),
    });
  }

  // Bot Management methods
  async getAllBots(): Promise<{ bots: any[] }> {
    return this.request('/bot');
  }

  async validateBotToken(token: string): Promise<{ success: boolean; bot?: any; error?: string }> {
    return this.request('/bot/validate-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async activateBot(token: string, organizationId: number): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request('/bot/activate', {
      method: 'POST',
      body: JSON.stringify({ token, organizationId }),
    });
  }

  async getBotStatus(organizationId: number): Promise<{ success: boolean; organization?: any; botStatus?: any; error?: string }> {
    return this.request(`/bot/status/${organizationId}`);
  }

  async getWebAppUrl(organizationId: number): Promise<{ success: boolean; url?: string }> {
    return this.request(`/bot/webapp-url/${organizationId}`);
  }

  async updateBotSettings(organizationId: number, settings: any): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request('/bot/settings', {
      method: 'PUT',
      body: JSON.stringify({ organizationId, ...settings }),
    });
  }

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

  async generateAdminLink(): Promise<{ success: boolean; adminLink?: string; deepLink?: string; linkToken?: string; expiresIn?: number; botUsername?: string; error?: string }> {
    return this.request('/bot/generate-admin-link', {
      method: 'POST',
    });
  }

  async unlinkAdmin(): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request('/bot/unlink-admin', {
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

  // Auth methods
  async logout(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
    
    // Clear the access token from the API client
    this.accessToken = null;
    
    return response;
  }

  // Notification methods
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<{
    notifications: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    unreadCount: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.unreadOnly) searchParams.set('unreadOnly', params.unreadOnly.toString());

    const queryString = searchParams.toString();
    const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsAsRead(): Promise<{ success: boolean }> {
    return this.request('/notifications/read-all', {
      method: 'POST',
    });
  }

  async deleteNotification(notificationId: string): Promise<{ success: boolean }> {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  async clearAllNotifications(): Promise<{ success: boolean }> {
    return this.request('/notifications/clear-all', {
      method: 'DELETE',
    });
  }

  async getNotificationStats(): Promise<{
    total: number;
    unread: number;
    byType: Array<{ type: string; _count: { type: number } }>;
    recent: any[];
  }> {
    return this.request('/notifications/stats');
  }

  async archiveNotification(notificationId: string): Promise<{ success: boolean }> {
    return this.request(`/notifications/${notificationId}/archive`, {
      method: 'POST',
    });
  }

  // Generic HTTP methods for direct API calls
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
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
    // Use the services stats endpoint which provides comprehensive data
    const servicesStats = await this.getServicesStats();
    
    return {
      totalAppointments: servicesStats.totalAppointments,
      todayAppointments: servicesStats.todayAppointments,
      weekAppointments: servicesStats.weekAppointments,
      pendingAppointments: servicesStats.pendingAppointments,
      totalServices: servicesStats.totalServices,
      activeServices: servicesStats.totalServices, // All services are considered active for now
      totalRevenue: servicesStats.totalRevenue,
      todayRevenue: servicesStats.todayRevenue
    };
  }

  // Appointments summary stats for AppointmentsSummaryCard
  async getAppointmentsSummaryStats(): Promise<{
    totalAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    rejectedAppointments: number;
  }> {
    return this.request('/appointments/summary-stats');
  }

  // Analytics data
  async getAnalytics(params?: {
    timePeriod?: 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalAppointments: number;
    totalRevenue: number;
    averageBookingTime: number;
    averageDuration: number;
    growthRate: number;
    activeClients: number;
    statusDistribution: Array<{
      name: string;
      value: number;
      count: number;
    }>;
    peakHours: Array<{
      hour: number;
      hourLabel: string;
      bookings: number;
    }>;
    topServices: Array<{
      serviceId: number;
      serviceName: string;
      bookings: number;
      revenue: number;
    }>;
    dailyBookings: Array<{
      date: string;
      day: string;
      dayShort: string;
      appointments: number;
      bookings: number;
      revenue: number;
    }>;
    monthlyTrends: Array<{
      month: string;
      bookings: number;
      revenue: number;
    }>;
    customerInsights: {
      newCustomers: number;
      returningCustomers: number;
      averageBookingFrequency: number;
      totalClients: number;
    };
    insights: {
      bestDay: { day: string; bookings: number } | null;
      peakTime: { hour: string; bookings: number } | null;
      topService: {
        serviceId: number;
        serviceName: string;
        bookings: number;
        revenue: number;
      } | null;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.timePeriod) searchParams.set('timePeriod', params.timePeriod);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);

    const queryString = searchParams.toString();
    const endpoint = `/analytics${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export types are already exported above as interfaces
