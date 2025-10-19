import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AIConfig {
  id?: number;
  organizationId: number;
  provider: 'openai' | 'claude' | 'custom';
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  baseSystemPrompt?: string;
  contextInstructions?: string;
  behaviorInstructions?: string;
  fallbackPrompt?: string;
  customPrompts?: {
    greeting?: string;
    bookingHelp?: string;
    serviceInfo?: string;
    general?: string;
    support?: string;
  };
  enabled: boolean;
}

export interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  averageTokensPerRequest: number;
  requestsByScenario: Record<string, number>;
}

export interface AvailableModel {
  id: string;
  name: string;
  description?: string;
  maxTokens?: number;
  cost?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIConfigService {
  private apiUrl = `${environment.apiUrl}/ai-config`;

  constructor(private http: HttpClient) {}

  // Получить конфигурацию AI для организации
  getAIConfig(organizationId: number): Observable<AIConfig> {
    return this.http.get<AIConfig>(`${this.apiUrl}/${organizationId}`);
  }

  // Сохранить конфигурацию AI
  saveAIConfig(config: AIConfig): Observable<AIConfig> {
    return this.http.post<AIConfig>(this.apiUrl, config);
  }

  // Обновить конфигурацию AI
  updateAIConfig(config: AIConfig): Observable<AIConfig> {
    return this.http.put<AIConfig>(`${this.apiUrl}/${config.organizationId}`, config);
  }

  // Удалить конфигурацию AI
  deleteAIConfig(organizationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${organizationId}`);
  }

  // Проверить валидность API ключа
  validateApiKey(provider: string, apiKey: string): Observable<{ valid: boolean; error?: string }> {
    return this.http.post<{ valid: boolean; error?: string }>(`${this.apiUrl}/validate`, {
      provider,
      apiKey
    });
  }

  // Получить доступные модели для провайдера
  getAvailableModels(provider: string, apiKey?: string): Observable<AvailableModel[]> {
    return this.http.post<AvailableModel[]>(`${this.apiUrl}/models`, {
      provider,
      apiKey
    });
  }

  // Протестировать AI конфигурацию
  testAIConfig(config: AIConfig, testMessage: string): Observable<{ success: boolean; response?: string; error?: string }> {
    return this.http.post<{ success: boolean; response?: string; error?: string }>(`${this.apiUrl}/test`, {
      config,
      testMessage
    });
  }

  // Получить статистику использования AI
  getUsageStats(organizationId: number, days: number = 30): Observable<AIUsageStats> {
    return this.http.get<AIUsageStats>(`${this.apiUrl}/${organizationId}/stats?days=${days}`);
  }

  // Получить логи использования AI
  getUsageLogs(organizationId: number, limit: number = 50): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${organizationId}/logs?limit=${limit}`);
  }
}
