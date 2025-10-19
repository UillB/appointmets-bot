import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';

export interface BotInfo {
  organizationId: number;
  organizationName: string;
  botToken: string | null;
  botUsername: string | null;
  isActive: boolean;
}

export interface BotStatus {
  isInitialized: boolean;
  activeBotsCount: number;
  activeTokens: string[];
}

export interface AllBotsResponse {
  success: boolean;
  status: BotStatus;
  bots: BotInfo[];
}

export interface BotValidationResponse {
  success: boolean;
  bot?: {
    id: number;
    username: string;
    first_name: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
  };
  error?: string;
}

export interface BotActivationRequest {
  token: string;
  organizationId: number;
}

export interface BotActivationResponse {
  success: boolean;
  organization?: {
    id: number;
    name: string;
    botUsername: string;
    botLink: string;
  };
  error?: string;
}

export interface BotStatusResponse {
  success: boolean;
  organization?: {
    id: number;
    name: string;
    botToken: string | null;
    botUsername: string | null;
  };
  botStatus?: {
    isActive: boolean;
    username?: string;
    firstName?: string;
    canJoinGroups?: boolean;
    canReadAllGroupMessages?: boolean;
    supportsInlineQueries?: boolean;
    botLink?: string;
    error?: string;
  };
  error?: string;
}

export interface WebAppUrlResponse {
  success: boolean;
  webAppUrl?: string;
  organization?: {
    id: number;
    name: string;
    botUsername: string | null;
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BotManagementService {

  constructor(private apiService: ApiService) {}

  // Get all bots (super admin only)
  getAllBots(): Observable<AllBotsResponse> {
    return this.apiService.get<AllBotsResponse>('/bot/all');
  }

  // Validate bot token
  validateBotToken(token: string): Observable<BotValidationResponse> {
    return this.apiService.post<BotValidationResponse>('/bot/validate-token', { token });
  }

  // Activate bot for organization
  activateBot(request: BotActivationRequest): Observable<BotActivationResponse> {
    return this.apiService.post<BotActivationResponse>('/bot/activate', request);
  }

  // Get bot status for organization
  getBotStatus(organizationId: number): Observable<BotStatusResponse> {
    return this.apiService.get<BotStatusResponse>(`/bot/status/${organizationId}`);
  }

  // Get WebApp URL for organization
  getWebAppUrl(organizationId: number): Observable<WebAppUrlResponse> {
    return this.apiService.get<WebAppUrlResponse>(`/bot/webapp-url/${organizationId}`);
  }

  // Update bot settings
  updateBotSettings(organizationId: number, settings: { name?: string; description?: string }): Observable<{ success: boolean; message?: string; error?: string }> {
    return this.apiService.put<{ success: boolean; message?: string; error?: string }>('/bot/settings', {
      organizationId,
      ...settings
    });
  }
}