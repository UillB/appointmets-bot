// Базовые типы для AI интеграции

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIConversation {
  messages: AIMessage[];
  context?: {
    organizationId: number;
    organizationName: string;
    services?: Array<{
      id: number;
      name: string;
      nameRu?: string;
      nameEn?: string;
      nameHe?: string;
      durationMin: number;
    }>;
    userInfo?: {
      chatId: string;
      name?: string;
    };
  };
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
}

export interface AIProvider {
  name: string;
  models: string[];
  sendMessage(conversation: AIConversation, model?: string): Promise<AIResponse>;
  validateConfig(config: any): boolean;
}

export interface AIConfig {
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
  enabled: boolean;
  baseUrl?: string;
}

export interface OrganizationAIConfig extends AIConfig {
  organizationId: number;
  customPrompts?: {
    greeting?: string;
    bookingHelp?: string;
    serviceInfo?: string;
    general?: string;
  };
}

// Типы для различных сценариев использования AI
export type AIScenario = 
  | 'greeting'
  | 'booking_help'
  | 'service_info'
  | 'general_chat'
  | 'appointment_reminder'
  | 'cancellation_help'
  | 'support'
  | 'general';

export interface AIScenarioConfig {
  scenario: AIScenario;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}
