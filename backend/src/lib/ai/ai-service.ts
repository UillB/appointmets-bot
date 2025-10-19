import { prisma } from '../prisma';
import { OpenAIProvider } from './openai-provider';
import { TestProvider } from './test-provider';
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
    // Регистрируем тестовый провайдер
    this.providers.set('custom', new TestProvider({} as AIConfig));
  }

  // Получить конфигурацию AI для организации
  async getOrganizationAIConfig(organizationId: number): Promise<OrganizationAIConfig | null> {
    try {
      const config = await (prisma as any).organizationAIConfig.findUnique({
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
        baseSystemPrompt: config.baseSystemPrompt || undefined,
        contextInstructions: config.contextInstructions || undefined,
        behaviorInstructions: config.behaviorInstructions || undefined,
        fallbackPrompt: config.fallbackPrompt || undefined,
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
      await (prisma as any).organizationAIConfig.upsert({
        where: { organizationId: config.organizationId },
        update: {
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.model,
          maxTokens: config.maxTokens,
          temperature: config.temperature,
          systemPrompt: config.systemPrompt,
          baseSystemPrompt: (config as any).baseSystemPrompt,
          contextInstructions: (config as any).contextInstructions,
          behaviorInstructions: (config as any).behaviorInstructions,
          fallbackPrompt: (config as any).fallbackPrompt,
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
          baseSystemPrompt: (config as any).baseSystemPrompt,
          contextInstructions: (config as any).contextInstructions,
          behaviorInstructions: (config as any).behaviorInstructions,
          fallbackPrompt: (config as any).fallbackPrompt,
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

      // ВСЕГДА получаем свежие данные организации для контекста (без кэширования)
      const organizationData = await this.getOrganizationContext(organizationId);
      
      // Добавляем контекст организации к разговору
      conversation.context = organizationData;

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
      
      const response = await configuredProvider.sendMessage(conversation, config.model);
      
      // Логируем использование после успешного ответа
      await this.logUsage(
        organizationId,
        response.usage?.totalTokens || 0,
        scenario,
        response.model
      );
      
      return response;
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
      case 'custom':
        return new TestProvider(config);
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

      const stats = await (prisma as any).aIUsageLog.findMany({
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
        totalTokens: stats.reduce((sum: number, stat: any) => sum + (stat.tokensUsed || 0), 0),
        averageTokensPerRequest: stats.length > 0 ? 
          stats.reduce((sum: number, stat: any) => sum + (stat.tokensUsed || 0), 0) / stats.length : 0,
        requestsByScenario: stats.reduce((acc: Record<string, number>, stat: any) => {
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
      await (prisma as any).aIUsageLog.create({
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

  // Получить контекст организации для AI
  private async getOrganizationContext(organizationId: number): Promise<any> {
    try {
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
          services: {
            include: {
              slots: {
                include: {
                  bookings: {
                    select: {
                      id: true,
                      chatId: true,
                      status: true,
                      createdAt: true
                    }
                  }
                },
                where: {
                  startAt: {
                    gte: new Date() // Только будущие слоты
                  }
                },
                orderBy: {
                  startAt: 'asc'
                }
              }
            }
          }
        }
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      // Собираем все слоты для проверки пересечений
      const allSlots = organization.services.flatMap(service => 
        service.slots.map(slot => ({
          ...slot,
          serviceName: service.nameRu || service.name,
          serviceId: service.id
        }))
      );

      // Обрабатываем слоты и записи с учетом пересечений
      const servicesWithSlots = organization.services.map(service => {
        const slots = service.slots.map(slot => {
          const isBooked = slot.bookings.length > 0;
          const appointment = slot.bookings[0]; // Предполагаем, что в слоте одна запись
          
          // Проверяем пересечения с другими занятыми слотами
          const hasTimeConflict = allSlots.some(otherSlot => {
            if (otherSlot.id === slot.id) return false; // Не сравниваем с самим собой
            
            const otherIsBooked = otherSlot.bookings.length > 0;
            if (!otherIsBooked) return false; // Нас интересуют только занятые слоты
            
            const slotStart = new Date(slot.startAt);
            const slotEnd = new Date(slot.endAt);
            const otherStart = new Date(otherSlot.startAt);
            const otherEnd = new Date(otherSlot.endAt);
            
            // Проверяем пересечение времени
            return slotStart < otherEnd && slotEnd > otherStart;
          });
          
          // Слот недоступен если он занят ИЛИ есть конфликт времени
          const isAvailable = !isBooked && !hasTimeConflict;
          
          return {
            id: slot.id,
            startAt: slot.startAt,
            endAt: slot.endAt,
            isAvailable: isAvailable,
            isBooked: isBooked,
            hasTimeConflict: hasTimeConflict,
            appointment: appointment ? {
              status: appointment.status,
              createdAt: appointment.createdAt
            } : null,
            capacity: slot.capacity,
            availableSpots: isAvailable ? slot.capacity - slot.bookings.length : 0
          };
        });

        // Группируем слоты по дням
        const slotsByDay = this.groupSlotsByDay(slots);
        
        return {
          id: service.id,
          name: service.nameRu || service.name,
          description: service.descriptionRu || service.description,
          duration: service.durationMin,
          price: (service as any).price,
          currency: (service as any).currency || 'RUB',
          priceFormatted: (service as any).price ? this.formatPrice((service as any).price, (service as any).currency || 'RUB') : null,
          slots: slots,
          slotsByDay: slotsByDay,
          totalSlots: slots.length,
          availableSlots: slots.filter(slot => slot.isAvailable).length,
          bookedSlots: slots.filter(slot => slot.isBooked).length
        };
      });

      // Получаем статистику по записям
      const appointmentStats = await this.getAppointmentStats(organizationId);

      // Получаем AI конфигурацию для добавления промптов в контекст
      const aiConfig = await this.getOrganizationAIConfig(organizationId);

      return {
        organizationName: organization.name,
        description: (organization as any).description,
        address: (organization as any).address,
        workingHours: (organization as any).workingHours,
        phone: (organization as any).phone,
        email: (organization as any).email,
        services: servicesWithSlots,
        appointmentStats: appointmentStats,
        currentDateTime: new Date().toISOString(),
        // Добавляем промпты из AI конфигурации
        baseSystemPrompt: aiConfig?.baseSystemPrompt,
        contextInstructions: aiConfig?.contextInstructions,
        behaviorInstructions: aiConfig?.behaviorInstructions,
        fallbackPrompt: aiConfig?.fallbackPrompt
      };
    } catch (error) {
      console.error('Error getting organization context:', error);
      throw error;
    }
  }

  // Группировка слотов по дням
  private groupSlotsByDay(slots: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    
    slots.forEach(slot => {
      const date = slot.startAt.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });
    
    return grouped;
  }

  // Получить статистику по записям
  private async getAppointmentStats(organizationId: number): Promise<any> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      // Статистика по статусам
      const statusStats = await prisma.appointment.groupBy({
        by: ['status'],
        where: {
          service: {
            organizationId: organizationId
          },
          slot: {
            startAt: {
              gte: today
            }
          }
        },
        _count: {
          id: true
        }
      });

      // Записи на сегодня
      const todayAppointments = await prisma.appointment.count({
        where: {
          service: {
            organizationId: organizationId
          },
          slot: {
            startAt: {
              gte: today,
              lt: tomorrow
            }
          }
        }
      });

      // Записи на завтра
      const tomorrowAppointments = await prisma.appointment.count({
        where: {
          service: {
            organizationId: organizationId
          },
          slot: {
            startAt: {
              gte: tomorrow,
              lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        }
      });

      // Записи на неделю
      const weekAppointments = await prisma.appointment.count({
        where: {
          service: {
            organizationId: organizationId
          },
          slot: {
            startAt: {
              gte: today,
              lt: nextWeek
            }
          }
        }
      });

      return {
        statusBreakdown: statusStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.id;
          return acc;
        }, {} as Record<string, number>),
        todayCount: todayAppointments,
        tomorrowCount: tomorrowAppointments,
        weekCount: weekAppointments,
        totalUpcoming: statusStats.reduce((sum, stat) => sum + stat._count.id, 0)
      };
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      return {
        statusBreakdown: {},
        todayCount: 0,
        tomorrowCount: 0,
        weekCount: 0,
        totalUpcoming: 0
      };
    }
  }

  // Получить статистику использования AI
  async getAIUsageStats(organizationId: number, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const usageLogs = await (prisma as any).aIUsageLog.findMany({
        where: {
          organizationId: organizationId,
          createdAt: {
            gte: startDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const totalRequests = usageLogs.length;
      const totalTokens = usageLogs.reduce((sum: number, log: any) => sum + log.tokensUsed, 0);
      const averageTokensPerRequest = totalRequests > 0 ? Math.round(totalTokens / totalRequests) : 0;

      // Группируем по сценариям
      const requestsByScenario = usageLogs.reduce((acc: Record<string, number>, log: any) => {
        const scenario = log.scenario || 'unknown';
        acc[scenario] = (acc[scenario] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalRequests,
        totalTokens,
        averageTokensPerRequest,
        requestsByScenario
      };
    } catch (error) {
      console.error('Error getting AI usage stats:', error);
      return {
        totalRequests: 0,
        totalTokens: 0,
        averageTokensPerRequest: 0,
        requestsByScenario: {}
      };
    }
  }

  // Форматирование цены
  private formatPrice(price: number, currency: string): string {
    const currencySymbols: Record<string, string> = {
      'RUB': '₽',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };

    const symbol = currencySymbols[currency] || currency;
    
    if (currency === 'RUB') {
      return `${Math.round(price)} ${symbol}`;
    } else {
      return `${price.toFixed(2)} ${symbol}`;
    }
  }
}
