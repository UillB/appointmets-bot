import { prisma } from '../prisma';
import { OpenAIProvider } from './openai-provider';
import { BaseAIProvider } from './base-provider';
import { 
  AIConversation, 
  AIResponse, 
  AIConfig, 
  OrganizationAIConfig,
  AIScenario 
} from './types';

export class AIService {
  private providers: Map<string, BaseAIProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Регистрируем OpenAI провайдер
    this.providers.set('openai', new OpenAIProvider({} as AIConfig));
  }

  // Получить конфигурацию AI для организации
  async getOrganizationAIConfig(organizationId: number): Promise<OrganizationAIConfig | null> {
    try {
      const config = await prisma.organizationAIConfig.findUnique({
        where: { organizationId }
      });

      if (!config) {
        return null;
      }

      return {
        organizationId: config.organizationId,
        provider: config.provider as 'openai' | 'claude' | 'custom',
        apiKey: config.apiKey,
        model: config.model,
        maxTokens: config.maxTokens || undefined,
        temperature: config.temperature || undefined,
        systemPrompt: config.systemPrompt || undefined,
        enabled: config.enabled,
        customPrompts: config.customPrompts ? JSON.parse(config.customPrompts) : undefined
      };
    } catch (error) {
      console.error('Error getting organization AI config:', error);
      return null;
    }
  }

  // Сохранить конфигурацию AI для организации
  async saveOrganizationAIConfig(config: OrganizationAIConfig): Promise<void> {
    try {
      await prisma.organizationAIConfig.upsert({
        where: { organizationId: config.organizationId },
        update: {
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.model,
          maxTokens: config.maxTokens,
          temperature: config.temperature,
          systemPrompt: config.systemPrompt,
          enabled: config.enabled,
          customPrompts: config.customPrompts ? JSON.stringify(config.customPrompts) : null
        },
        create: {
          organizationId: config.organizationId,
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.model,
          maxTokens: config.maxTokens,
          temperature: config.temperature,
          systemPrompt: config.systemPrompt,
          enabled: config.enabled,
          customPrompts: config.customPrompts ? JSON.stringify(config.customPrompts) : null
        }
      });
    } catch (error) {
      console.error('Error saving organization AI config:', error);
      throw error;
    }
  }

  // Отправить сообщение через AI
  async sendMessage(
    organizationId: number, 
    conversation: AIConversation, 
    scenario?: AIScenario
  ): Promise<AIResponse> {
    try {
      const config = await this.getOrganizationAIConfig(organizationId);
      
      if (!config || !config.enabled) {
        throw new Error('AI is not configured or enabled for this organization');
      }

      const provider = this.providers.get(config.provider);
      if (!provider) {
        throw new Error(`AI provider '${config.provider}' is not supported`);
      }

      // Применяем сценарий-специфичный промпт если есть
      if (scenario && config.customPrompts) {
        const scenarioKey = scenario.replace('_', '') as keyof typeof config.customPrompts;
        if (config.customPrompts[scenarioKey]) {
          conversation.messages.unshift({
            role: 'system',
            content: config.customPrompts[scenarioKey]!
          });
        }
      }

      // Создаем провайдер с конфигурацией организации
      const configuredProvider = this.createConfiguredProvider(config);
      
      return await configuredProvider.sendMessage(conversation, config.model);
    } catch (error) {
      console.error('Error sending AI message:', error);
      throw error;
    }
  }

  // Создать настроенный провайдер
  private createConfiguredProvider(config: OrganizationAIConfig): BaseAIProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }

  // Проверить валидность API ключа
  async validateApiKey(provider: string, apiKey: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const providerInstance = this.providers.get(provider);
      if (!providerInstance) {
        return { valid: false, error: `Provider '${provider}' not supported` };
      }

      // Создаем временный провайдер для проверки
      const tempConfig: AIConfig = {
        provider: provider as any,
        apiKey,
        model: 'gpt-4o-mini',
        enabled: true
      };

      const tempProvider = this.createConfiguredProvider(tempConfig as OrganizationAIConfig);
      
      if (provider === 'openai' && tempProvider instanceof OpenAIProvider) {
        return await tempProvider.checkApiKey();
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Получить доступные модели для провайдера
  async getAvailableModels(provider: string, apiKey?: string): Promise<string[]> {
    try {
      const providerInstance = this.providers.get(provider);
      if (!providerInstance) {
        return [];
      }

      if (provider === 'openai' && apiKey) {
        const tempConfig: AIConfig = {
          provider: 'openai',
          apiKey,
          model: 'gpt-4o-mini',
          enabled: true
        };
        const tempProvider = new OpenAIProvider(tempConfig);
        return await tempProvider.getAvailableModels();
      }

      return providerInstance.models;
    } catch (error) {
      console.error('Error getting available models:', error);
      const providerInstance = this.providers.get(provider);
      return providerInstance?.models || [];
    }
  }

  // Получить статистику использования AI для организации
  async getUsageStats(organizationId: number, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await prisma.aIUsageLog.findMany({
        where: {
          organizationId,
          createdAt: {
            gte: startDate
          }
        },
        select: {
          tokensUsed: true,
          createdAt: true,
          scenario: true
        }
      });

      return {
        totalRequests: stats.length,
        totalTokens: stats.reduce((sum, stat) => sum + (stat.tokensUsed || 0), 0),
        averageTokensPerRequest: stats.length > 0 ? 
          stats.reduce((sum, stat) => sum + (stat.tokensUsed || 0), 0) / stats.length : 0,
        requestsByScenario: stats.reduce((acc, stat) => {
          const scenario = stat.scenario || 'unknown';
          acc[scenario] = (acc[scenario] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      console.error('Error getting AI usage stats:', error);
      return null;
    }
  }

  // Логировать использование AI
  async logUsage(
    organizationId: number, 
    tokensUsed: number, 
    scenario?: AIScenario,
    model?: string
  ): Promise<void> {
    try {
      await prisma.aIUsageLog.create({
        data: {
          organizationId,
          tokensUsed,
          scenario,
          model,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging AI usage:', error);
      // Не выбрасываем ошибку, так как это не критично
    }
  }
}
