const API_BASE_URL = 'http://localhost:4000/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request('/dashboard/stats');
  }

  // Appointments
  async getAppointments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    serviceId?: string;
    date?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.serviceId) searchParams.set('serviceId', params.serviceId);
    if (params?.date) searchParams.set('date', params.date);
    
    const query = searchParams.toString();
    return this.request(`/appointments${query ? `?${query}` : ''}`);
  }

  async createAppointment(data: {
    serviceId: string;
    slotId: string;
    chatId: string;
  }) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointment(id: string, data: Partial<Appointment>) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAppointment(id: string) {
    return this.request(`/appointments/${id}`, { method: 'DELETE' });
  }

  // Services
  async getServices() {
    return this.request('/services');
  }

  async createService(data: {
    name: string;
    description?: string;
    duration: number;
    price: number;
  }) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, data: Partial<Service>) {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: string) {
    return this.request(`/services/${id}`, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();